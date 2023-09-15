const request = require("supertest");
const { describe, it } = require("node:test");
const { createApp } = require("../../src/app");
const Game = require("../../src/models/game");
const Board = require("../../src/models/board");
const Players = require("../../src/models/players");
const Player = require("../../src/models/player");

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
    const playersInfo = context.mock.fn(() => ({}));
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

  it("Should redirect to joining page when the game has not started", (context, done) => {
    const state = context.mock.fn(() => ({ currentPlayerId: 1 }));
    const status = context.mock.fn(() => ({ isGameStarted: false }));
    const lobby = { status };
    const game = { state };
    const app = createApp();
    app.context = { game, lobby };

    request(app)
      .get("/game/state")
      .expect(302)
      .set("Cookie", "playerId=3")
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
      character: "mustard",
      position: { x: 2, y: 4 }
    });
    const players = new Players([gourab]);

    const board = new Board({
      blockedTiles: [],
      rooms: {},
      dimensions: { length: 24, breadth: 25 }
    });

    const game = new Game({ players, board });
    const app = createApp();
    app.context = { game };

    game.start();

    request(app)
      .patch("/game/move-pawn")
      .set("Cookie", "playerId=1")
      .send({ x: 1, y: 2 })
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({})
      .end(done);
  });

  it("should not move the pawn to a blockedTile", (context, done) => {
    const gourab = new Player({
      id: 1,
      name: "gourab",
      cards: [],
      character: "mustard",
      position: { x: 2, y: 4 }
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
      .set("Cookie", "playerId=1")
      .send({ x: 1, y: 2 })
      .expect(400)
      .end(done);
  });

  it("should not move the pawn to a room", (context, done) => {
    const gourab = new Player({
      id: 1,
      name: "gourab",
      cards: [],
      character: "mustard",
      position: { x: 2, y: 4 }
    });
    const players = new Players([gourab]);

    const board = new Board({
      blockedTiles: [{ x: 1, y: 2 }],
      rooms: {
        hall: {
          tileRows: [
            [
              { x: 0, y: 0 },
              { x: 0, y: 10 }
            ]
          ]
        }
      },
      dimensions: { length: 24, breadth: 25 }
    });

    const game = new Game({ players, board });
    const app = createApp();
    app.context = { game };

    game.start();

    request(app)
      .patch("/game/move-pawn")
      .set("Cookie", "playerId=1")
      .send({ x: 0, y: 2 })
      .expect(400)
      .end(done);
  });

  it("should not move the pawn if the it's not the player's turn", (context, done) => {
    const players = {
      add: context.mock.fn(),
      info: context.mock.fn(() => "Mock Data"),
      getNextPlayer: context.mock.fn(() => ({
        info: () => ({ id: 1 })
      }))
    };

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
