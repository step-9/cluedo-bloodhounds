const request = require("supertest");
const { describe, it } = require("node:test");
const { createApp } = require("../../src/app");

const rooms = require("../../resources/rooms.json");
const validTiles = require("../../resources/valid-tiles.json");
const initialPositions = require("../../resources/initial-positions.json");

const Game = require("../../src/models/game");
const Board = require("../../src/models/board");
const Players = require("../../src/models/players");
const Player = require("../../src/models/player");

const createPlayer = (id, name, cards, character, position) =>
  new Player({
    id,
    name,
    character,
    cards,
    position
  }).setupInitialPermissions();

const createPlayers = () => {
  const gourab = new Player({
    id: 1,
    name: "gourab",
    cards: [],
    character: "mustard",
    position: { x: 1, y: 4 }
  }).setupInitialPermissions();

  return new Players([gourab]);
};

describe("GET /game", () => {
  it("should redirect to homepage when game not started", (context, done) => {
    const app = createApp();
    const lobby = {
      status: context.mock.fn(() => ({
        isGameStarted: false
      }))
    };
    app.context = { lobby };

    request(app).get("/game").expect(302).expect("location", "/").end(done);
  });

  it("should serve the game page when the game has started", (context, done) => {
    const app = createApp();
    const lobby = {
      status: context.mock.fn(() => ({
        isGameStarted: true
      }))
    };
    app.context = { lobby };

    request(app)
      .get("/game")
      .expect(200)
      .expect("content-type", /text\/html/)
      .end(done);
  });
});

describe("GET /game/initial-state", () => {
  it("should give the initial state of the game", (context, done) => {
    const playersInfo = context.mock.fn(() => ({ players: [{ cards: {} }] }));
    const getCardsOfPlayer = context.mock.fn();
    const game = { playersInfo, getCardsOfPlayer };

    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/initial-state")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("GET /game/state", () => {
  it("Should give the game state if the game is already started", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const status = context.mock.fn(() => ({ isGameStarted: true }));
    const lobby = { status };
    const game = { state };
    const app = createApp();
    app.context = { game, lobby };

    request(app)
      .get("/game/state")
      .expect(200)
      .set("Cookie", "playerId=3")
      .expect("content-type", /application\/json/)
      .expect({ currentPlayerId: 1, isYourTurn: false })
      .end(done);
  });

  it("Should clear the lobby when game ends", (context, done) => {
    const state = context.mock.fn(() => ({
      isGameOver: true,
      currentPlayerId: 1
    }));
    const clear = context.mock.fn();
    const lobby = { clear };
    const game = { state };
    const app = createApp();
    app.context = { game, lobby };

    request(app)
      .get("/game/state")
      .expect(200)
      .set("Cookie", "playerId=3")
      .expect("content-type", /application\/json/)
      .expect({ currentPlayerId: 1, isGameOver: true, isYourTurn: false })
      .end(done);
  });
});

describe("GET /game/end-turn", () => {
  it("Should give error if its not player turn", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const game = { state };
    const app = createApp();
    app.context = { game };

    request(app)
      .post("/game/end-turn")
      .set("Cookie", "playerId=2")
      .expect(401)
      .expect("content-type", /application\/json/)
      .expect({ error: "not your turn" })
      .end(done);
  });

  it("Should change the turn if its player's turn", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const changeTurn = context.mock.fn();
    const game = { state, changeTurn };
    const app = createApp();
    app.context = { game };

    request(app)
      .post("/game/end-turn")
      .set("Cookie", "playerId=1")
      .expect(200)
      .end(done);
  });
});

describe("PATCH /game/move-pawn", () => {
  it("should move the pawn if the given tile is valid", (context, done) => {
    const gourab = new Player({
      id: 1,
      name: "gourab",
      cards: [],
      character: "mustard"
    });
    const players = new Players([gourab]);

    const board = new Board({
      validTiles,
      rooms,
      initialPositions
    });

    const game = new Game({ players, board });
    game.start();
    game.updateDiceCombination([1, 1]);

    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/move-pawn")
      .set("Cookie", "playerId=1")
      .send({ x: 22, y: 6 })
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });

  it("should not move the pawn to a blockedTile", (context, done) => {
    const gourab = new Player({
      id: 1,
      name: "gourab",
      cards: [],
      character: "mustard",
      position: { x: 1, y: 4 }
    });
    const players = new Players([gourab]);

    const board = new Board({
      validTiles,
      rooms,
      initialPositions
    });

    const game = new Game({ players, board });
    game.start();
    game.updateDiceCombination([1, 1]);

    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/move-pawn")
      .set("Cookie", "playerId=1")
      .send({ x: 1, y: 2 })
      .expect(400)
      .end(done);
  });

  it("should not move the pawn if the it's not the player's turn", (context, done) => {
    const gourab = new Player({
      id: 1,
      name: "gourab",
      cards: [],
      character: "mustard",
      position: { x: 1, y: 4 }
    });
    const players = new Players([gourab]);

    const board = new Board({
      blockedTiles: [{ x: 1, y: 2 }],
      rooms: {},
      dimensions: { length: 24, breadth: 25 }
    });

    const game = new Game({ players, board });
    const app = createApp();
    app.context = { game };

    game.start();

    request(app)
      .patch("/game/move-pawn")
      .set("Cookie", "playerId=2")
      .expect(400)
      .end(done);
  });

  it("should move the pawn to a room and update the player's last suspicion position", (context, done) => {
    const gourab = new Player({
      id: 1,
      name: "gourab",
      cards: [],
      character: "mustard"
    });
    const players = new Players([gourab]);

    const board = new Board({
      validTiles,
      rooms,
      initialPositions
    });

    const game = new Game({ players, board });
    game.start();
    game.updateDiceCombination([5, 5]);

    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/move-pawn")
      .set("Cookie", "playerId=1")
      .send({ x: 19, y: 4 })
      .expect(200)
      .end(done);
  });
});

describe("GET /game/cards", () => {
  it("should give cards info", (context, done) => {
    const app = createApp();

    request(app)
      .get("/game/cards")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("GET /game/character-positions", () => {
  it("should give positions of all characters", (context, done) => {
    const getCharacterPositions = context.mock.fn();
    const game = { getCharacterPositions };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/character-positions")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("GET /game/deny-suspicion", () => {
  it("should revoke suspect permission from current player", (context, done) => {
    const players = createPlayers();
    const game = new Game({ players });

    game.start();

    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/deny-suspicion")
      .send({ canSuspect: false })
      .set("Cookie", "playerId=1")
      .expect(200)
      .end(done);
  });

  it("should respond with error if it is not current player's turn", (context, done) => {
    const players = createPlayers();
    const game = new Game({ players });

    game.start();

    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/deny-suspicion")
      .set("Cookie", "playerId=2")
      .expect(401)
      .expect("content-type", /application\/json/)
      .expect({ error: "not your turn" })
      .end(done);
  });
});

describe("GET /game/accusation-result", () => {
  it("should give result of last accusation", (context, done) => {
    const getLastAccusationCombination = context.mock.fn();
    const game = { getLastAccusationCombination };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/accusation-result")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("GET /game/game-over-info", () => {
  it("should give game over info", (context, done) => {
    const getGameOverInfo = context.mock.fn();
    const game = { getGameOverInfo };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/game-over-info")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("GET /game/start-accusation", () => {
  it("Should give error if its not player turn", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const game = { state };
    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/accusation-state")
      .set("Cookie", "playerId=2")
      .expect(401)
      .expect("content-type", /application\/json/)
      .expect({ error: "not your turn" })
      .end(done);
  });

  it("Should set the isAccusation status true when its players turn", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const toggleIsAccusing = context.mock.fn();
    const game = { state, toggleIsAccusing };
    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/accusation-state")
      .set("Cookie", "playerId=1")
      .expect(200)
      .end(done);
  });
});

describe("POST /game/accuse", () => {
  it("Should end the game as the combination is correct", (context, done) => {
    const killingCombination = {
      weapon: "dagger",
      suspect: "mustard",
      room: "lounge"
    };
    const validateAccuse = () => ({ isWon: true, killingCombination });
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const game = { validateAccuse, state };
    const app = createApp({});
    app.context = { game };

    request(app)
      .post("/game/accuse")
      .send({ weapon: "dagger", suspect: "mustard", room: "lounge" })
      .set("Cookie", "playerId=1")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({ isWon: true, killingCombination })
      .end(done);
  });

  it("Should give error if its not player turn", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const game = { state };
    const app = createApp();
    app.context = { game };

    request(app)
      .post("/game/accuse")
      .set("Cookie", "playerId=2")
      .expect(401)
      .expect("content-type", /application\/json/)
      .expect({ error: "not your turn" })
      .end(done);
  });
});

describe("POST /roll-dice", () => {
  it("should handle roll dice and give the dice combination", (_, done) => {
    const diceCombinationGenerator = { next: () => ({ value: [4, 4] }) };
    const findPossiblePositions = () => {};
    const updateDiceCombination = () => {};
    const updatePossiblePositions = () => {};
    const state = () => ({ currentPlayerId: 2 });

    const game = {
      updateDiceCombination,
      findPossiblePositions,
      updatePossiblePositions,
      state
    };
    const app = createApp();
    app.context = { game, diceCombinationGenerator };

    request(app)
      .post("/game/roll-dice")
      .set("Cookie", "playerId=2")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({ diceRollCombination: [4, 4] })
      .end(done);
  });

  it("should handle roll dice if the player is not the current player", (_, done) => {
    const diceCombinationGenerator = { next: () => ({ value: [4, 4] }) };
    const findPossiblePositions = () => {};
    const updateDiceCombination = () => {};
    const updatePossiblePositions = () => {};
    const state = () => ({ currentPlayerId: 1 });

    const game = {
      updateDiceCombination,
      findPossiblePositions,
      updatePossiblePositions,
      state
    };
    const app = createApp();
    app.context = { game, diceCombinationGenerator };

    request(app)
      .post("/game/roll-dice")
      .set("Cookie", "playerId=2")
      .expect(401)
      .expect("content-type", /application\/json/)
      .expect({ error: "not your turn" })
      .end(done);
  });
});

describe("GET /dice-combination", () => {
  it("should give the dice combination and the possible positions if its players turn", (_, done) => {
    const getLastDiceCombination = () => [4, 4];
    const getPossiblePositions = () => {};
    const state = () => ({ currentPlayerId: 2 });

    const game = { getLastDiceCombination, getPossiblePositions, state };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/dice-combination")
      .set("Cookie", "playerId=2")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({ diceRollCombination: [4, 4] })
      .end(done);
  });

  it("should give the dice combination only when its not players turn", (_, done) => {
    const getLastDiceCombination = () => [4, 4];
    const getPossiblePositions = () => {};
    const state = () => ({ currentPlayerId: 2 });

    const game = { getLastDiceCombination, getPossiblePositions, state };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/dice-combination")
      .set("Cookie", "playerId=1")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({ diceRollCombination: [4, 4] })
      .end(done);
  });
});

describe("PATCH /game/suspicion-state", () => {
  it("Should give error if its not player turn", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const game = { state };
    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/suspicion-state")
      .set("Cookie", "playerId=2")
      .expect(401)
      .expect("content-type", /application\/json/)
      .expect({ error: "not your turn" })
      .end(done);
  });

  it("Should set the isSuspecting status true when its players turn", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const toggleIsSuspecting = context.mock.fn();
    const game = { state, toggleIsSuspecting };
    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/suspicion-state")
      .set("Cookie", "playerId=1")
      .expect(200)
      .end(done);
  });
});

describe("GET /game/suspicion-combination", () => {
  it("should give result of last suspicion", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const getLastSuspicionCombination = context.mock.fn();
    const getCharacterPositions = () => {};
    const ruleOutSuspicion = context.mock.fn(() => ({
      invalidatedBy: 2,
      matchingCards: []
    }));
    const game = {
      getLastSuspicionCombination,
      ruleOutSuspicion,
      state,
      getCharacterPositions
    };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/suspicion-combination")
      .set("Cookie", "playerId=1")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });

  it("should give result of last suspicion", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const getLastSuspicionCombination = context.mock.fn();
    const getCharacterPositions = () => {};
    const ruleOutSuspicion = context.mock.fn(() => ({
      invalidatedBy: 2,
      matchingCards: []
    }));
    const game = {
      getLastSuspicionCombination,
      ruleOutSuspicion,
      state,
      getCharacterPositions
    };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/suspicion-combination")
      .set("Cookie", "playerId=2")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("POST /game/suspect", () => {
  it("Should start suspicion if its current player turn", (context, done) => {
    const suspicionCombination = {
      weapon: "dagger",
      suspect: "mustard",
      room: "lounge"
    };
    const validateSuspicion = () => ({
      isWon: true,
      killingCombination: suspicionCombination
    });
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const move = context.mock.fn();
    const game = { validateSuspicion, state, move };
    const app = createApp({});
    app.context = { game };

    request(app)
      .post("/game/suspect")
      .set("Cookie", "playerId=1")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });

  it("Should give error if its not player turn", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const game = { state };
    const app = createApp();
    app.context = { game };

    request(app)
      .post("/game/suspect")
      .set("Cookie", "playerId=2")
      .expect(401)
      .expect("content-type", /application\/json/)
      .expect({ error: "not your turn" })
      .end(done);
  });
});

describe("GET /game/last-suspicion-position", () => {
  it("should give the last suspicion position of the current player", (context, done) => {
    const getLastSuspicionPosition = context.mock.fn(() => "lounge");
    const game = { getLastSuspicionPosition };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/last-suspicion-position")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({ room: "lounge" })
      .end(done);
  });
});

describe("POST /game/suspect/invalidate", () => {
  it("should post the invalidated card", (_, done) => {
    const game = { invalidateSuspicion: () => {} };
    const app = createApp();
    app.context = { game };

    request(app)
      .post("/game/suspect/invalidate")
      .send({ title: "mustard" })
      .expect(200)
      .end(done);
  });
});

describe("GET /game/suspect/invalidate", () => {
  it("Should send the invalidator only id when current player is not asking", (_, done) => {
    const game = {
      getLastSuspicion: () => ({ invalidatorId: 2 }),
      state: () => ({ currentPlayerId: 1 })
    };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/suspect/invalidate")
      .set("Cookie", "playerId=2")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({ invalidatorId: 2 })
      .end(done);
  });

  it("Should send both the invalidatorId and invalidatedCard when current player is asking", (_, done) => {
    const game = {
      getLastSuspicion: () => ({ invalidatorId: 2, invalidatedCard: "lounge" }),
      state: () => ({ currentPlayerId: 1 })
    };
    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/suspect/invalidate")
      .set("Cookie", "playerId=1")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({ invalidatorId: 2, invalidatedCard: "lounge" })
      .end(done);
  });
});

describe("PATCH /game/accuse", () => {
  it("Should cancel the accusation", (_, done) => {
    const game = {
      cancelAccusation: () => ({}),
      state: () => ({ currentPlayerId: 1 })
    };
    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/accuse")
      .set("Cookie", "playerId=1")
      .send({ isAccusing: false })
      .expect(200)
      .end(done);
  });

  it("Should not allow any other player other than current player to cancel the accusation", (_, done) => {
    const game = {
      state: () => ({ currentPlayerId: 1 })
    };
    const app = createApp();
    app.context = { game };

    request(app)
      .patch("/game/accuse")
      .set("Cookie", "playerId=2")
      .send({ isAccusing: false })
      .expect(401)
      .end(done);
  });
});
