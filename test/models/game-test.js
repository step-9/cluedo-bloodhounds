const { describe, it } = require("node:test");
const assert = require("assert");
const Game = require("../../src/models/game");
const Board = require("../../src/models/board");
const rooms = require("../../resources/rooms.json");
const validTiles = require("../../resources/valid-tiles.json");
const initialPositions = require("../../resources/initial-positions.json");
const staircase = require("../../resources/staircase.json");
const Player = require("../../src/models/player");
const Players = require("../../src/models/players");

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

describe("Game", () => {
  describe("start", () => {
    it("should start the game", context => {
      const players = createPlayers();
      const game = new Game({ players });

      game.start();

      const expectedGameStatus = {
        action: "turnEnded",
        currentPlayerId: 1,
        isGameOver: false
      };

      assert.deepStrictEqual(game.state(), expectedGameStatus);
    });
  });

  describe("getCardsOfPlayer", () => {
    it("should give the cards of player with given id", context => {
      const players = createPlayers();
      const game = new Game({ players });

      assert.deepStrictEqual(game.getCardsOfPlayer(1), []);
    });
  });

  describe("state", () => {
    it("Should give the current game state", context => {
      const players = createPlayers();
      const game = new Game({ players });

      game.start();

      assert.strictEqual(game.state().currentPlayerId, 1);
    });
  });

  describe("move", () => {
    it("Should move the suspect to given room", context => {
      const players = createPlayers();
      const board = new Board({
        validTiles,
        rooms,
        initialPositions: { ...initialPositions }
      });

      const game = new Game({ players, board });

      game.start();
      game.move("mustard", "kitchen");

      assert.deepStrictEqual(game.getCharacterPositions().mustard, {
        x: 19,
        y: 20
      });
    });
  });

  describe("change turn", () => {
    it("should change the current player to the next player", context => {
      const players = createPlayers();
      const board = new Board({
        validTiles,
        rooms,
        initialPositions: { ...initialPositions }
      });

      const game = new Game({ players, board });

      game.start();
      game.move("mustard", "lounge");
      game.changeTurn();

      assert.ok(game.playersInfo().canSuspect);
    });

    it("should not allow player to suspect if the player is in a tile", context => {
      const players = createPlayers();
      const board = new Board({
        validTiles,
        rooms,
        initialPositions: { ...initialPositions }
      });

      const game = new Game({ players, board });

      game.start();
      game.changeTurn();

      assert.ok(!game.playersInfo().canSuspect);
    });

    it("should allow player to move through passage if it is in a room having a passage", context => {
      const players = createPlayers();
      const board = new Board({
        validTiles,
        rooms,
        initialPositions: { ...initialPositions }
      });

      players.updateLastSuspicionPosition(1, "lounge");
      const game = new Game({ players, board });

      game.start();
      game.move("mustard", "lounge");
      game.changeTurn();

      assert.ok(game.playersInfo().canMovePawn);
    });

    it("should not allow player to move through passage if it is in a room not having a passage", context => {
      const players = createPlayers();
      const board = new Board({
        validTiles,
        rooms,
        initialPositions: { ...initialPositions }
      });

      players.updateLastSuspicionPosition(1, "hall");
      const game = new Game({ players, board });

      game.start();
      game.move("mustard", "hall");
      game.changeTurn();

      assert.ok(!game.playersInfo().canMovePawn);
    });
  });

  describe("toggleIsAccusing", () => {
    it("should toggle the isAccusing status", () => {
      const players = createPlayers();
      const game = new Game({ players });

      game.start();
      game.toggleIsAccusing();

      assert.strictEqual(game.state().action, "accusing");
    });
  });

  describe("validateAccuse", () => {
    it("should declare the winner and end the game as combination matches", context => {
      const killingCombination = {
        weapon: "dagger",
        room: "lounge",
        suspect: "mustard"
      };

      const players = createPlayers();
      const game = new Game({ players, killingCombination });
      game.start();

      const expectedAccusationResult = {
        killingCombination: {
          weapon: "dagger",
          room: "lounge",
          suspect: "mustard"
        },
        isGameWon: true
      };

      game.validateAccuse({
        weapon: "dagger",
        room: "lounge",
        suspect: "mustard"
      });
      assert.deepStrictEqual(game.getGameOverInfo(), expectedAccusationResult);
    });

    it("should make the player stranded as the combination is wrong", context => {
      const killingCombination = {
        weapon: "dagger",
        room: "lounge",
        suspect: "plum"
      };
      const board = new Board({
        validTiles,
        rooms,
        initialPositions: { ...initialPositions },
        staircase
      });
      const players = createPlayers();
      const game = new Game({ players, killingCombination, board });
      game.start();

      const playerAccusation = { ...killingCombination, suspect: "mustard" };
      const accusationResult = game.validateAccuse(playerAccusation);

      const expectedAccusationResult = {
        isWon: false,
        killingCombination: {
          weapon: "dagger",
          room: "lounge",
          suspect: "plum"
        }
      };

      assert.deepStrictEqual(accusationResult, expectedAccusationResult);
    });
  });

  describe("getLastAccusationCombination", () => {
    it("Should give the accusation combination of last validation", context => {
      const killingCombination = {
        weapon: "dagger",
        room: "lounge",
        suspect: "plum"
      };
      const players = createPlayers();
      const game = new Game({ players, killingCombination });
      game.start();

      const accusingCombination = {
        weapon: "dagger",
        room: "lounge",
        suspect: "plum"
      };

      game.validateAccuse(accusingCombination);

      assert.deepStrictEqual(
        game.getLastAccusationCombination(),
        accusingCombination
      );
    });
  });

  describe("getLastSuspicionCombination", () => {
    it("Should give the suspicion combination of last validation", context => {
      const players = createPlayers();
      const game = new Game({ players });

      const suspicionCombination = {
        weapon: "dagger",
        room: "lounge",
        suspect: "plum"
      };

      game.validateSuspicion(1, suspicionCombination);

      assert.deepStrictEqual(
        game.getLastSuspicionCombination(),
        suspicionCombination
      );
    });
  });

  describe("getCharacterPositions", () => {
    it("Should give the current positions of all characters", context => {
      const players = createPlayers();
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });
      const game = new Game({ players, board });
      game.start();

      assert.deepStrictEqual(game.getCharacterPositions(), {
        green: {
          x: 9,
          y: 24
        },
        mustard: {
          x: 23,
          y: 7
        },
        peacock: {
          x: 0,
          y: 18
        },
        plum: {
          x: 0,
          y: 5
        },
        scarlet: {
          x: 16,
          y: 0
        },
        white: {
          x: 14,
          y: 24
        }
      });
    });
  });

  describe("getLastDiceCombination", () => {
    it("Should give the last dice combination", () => {
      const players = createPlayers();
      const game = new Game({ players });
      game.start();
      game.updateDiceCombination([4, 4]);

      assert.deepStrictEqual(game.getLastDiceCombination(), [4, 4]);
    });
  });

  describe("playersInfo", () => {
    it("Should give the players info", context => {
      const players = createPlayers();
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });
      const game = new Game({ players, board });

      game.start();
      const expectedPlayerInfo = {
        players: [
          {
            cards: [],
            id: 1,
            name: "gourab",
            character: "mustard",
            isStranded: false,
            lastSuspicionPosition: ""
          }
        ],
        currentPlayerId: 1,
        strandedPlayerIds: [],
        characterPositions: {
          scarlet: { x: 16, y: 0 },
          mustard: { x: 23, y: 7 },
          white: { x: 14, y: 24 },
          green: { x: 9, y: 24 },
          peacock: { x: 0, y: 18 },
          plum: { x: 0, y: 5 }
        },
        diceRollCombination: [0, 0],
        isAccusing: false,
        isSuspecting: false,
        canAccuse: true,
        canRollDice: true,
        canMovePawn: false,
        canSuspect: false,
        shouldEndTurn: false,
        room: { name: "", passage: null }
      };

      assert.deepStrictEqual(game.playersInfo(), expectedPlayerInfo);
    });
  });

  describe("findPossiblePositions", () => {
    it("Should give all the possible possitions based on the step", () => {
      const sauma = createPlayer(1, "sauma", [], "green");
      const gourab = createPlayer(2, "gourab", [], "plum");
      const players = new Players([sauma, gourab]);

      const board = new Board({ validTiles, rooms, initialPositions });
      const game = new Game({ players, board });

      game.start();

      const expectedPositions = { "7,23": { x: 7, y: 23 } };

      assert.deepStrictEqual(game.findPossiblePositions(3), expectedPositions);
    });

    it("Should give possible positions as empty when when there is no where to move", () => {
      const sauma = createPlayer(1, "sauma", [], "green");
      const players = new Players([sauma]);
      const board = new Board({ validTiles, rooms, initialPositions });
      const game = new Game({ players, board });

      game.start();
      const expectedPositions = {};

      assert.deepStrictEqual(game.findPossiblePositions(0), expectedPositions);
    });
  });

  describe("getPossiblePositions", () => {
    it("Should get the Posible Positions", () => {
      const game = new Game({});
      game.updatePossiblePositions({ "1,4": { x: 1, y: 4 } });

      assert.deepStrictEqual(game.getPossiblePositions(), {
        "1,4": { x: 1, y: 4 }
      });
    });
  });

  describe("toggleIsSuspecting", () => {
    it("should toggle the isSuspecting status", () => {
      const players = createPlayers();
      const game = new Game({ players });

      game.start();
      game.toggleIsSuspecting();

      assert.strictEqual(game.state().action, "suspecting");
    });
  });

  describe("getLastSuspicionPosition", () => {
    it("should give the last suspicion position of current player", () => {
      const game = new Game({
        players: {
          getLastSuspicionPosition: () => "lounge"
        }
      });

      assert.strictEqual(game.getLastSuspicionPosition(1), "lounge");
    });
  });

  describe("ruleOutSuspicion", () => {
    it("should give id of the invalidator and matching cards", () => {
      const DAGGER = { type: "weapon", title: "dagger" };
      const MUSTARD = { type: "suspect", title: "mustard" };

      const gourab = createPlayer(1, "gourab", [], "mustard", { x: 1, y: 4 });
      const sauma = createPlayer(2, "sauma", [DAGGER, MUSTARD], "scarlet", {
        x: 0,
        y: 8
      });

      const players = new Players([gourab, sauma]);
      const game = new Game({ players });

      game.start();
      game.validateSuspicion(1, { weapon: "dagger", suspect: "mustard" });

      assert.deepStrictEqual(game.ruleOutSuspicion(), {
        invalidatedBy: 2,
        matchingCards: [DAGGER, MUSTARD]
      });
    });
  });

  describe("invalidateSuspicion", () => {
    it("should invalidate the suspicion and change the action performed in the game to invalidated", () => {
      const MUSTARD = { type: "suspect", title: "mustard" };

      const gourab = createPlayer(1, "gourab", [], "mustard", { x: 1, y: 4 });
      const sauma = createPlayer(2, "sauma", [MUSTARD], "scarlet", {
        x: 0,
        y: 8
      });
      const players = new Players([gourab, sauma]);
      const game = new Game({ players });
      game.start();
      game.validateSuspicion(1, { weapon: "dagger", suspect: "mustard" });
      game.invalidateSuspicion(2, "mustard");

      assert.deepStrictEqual(game.state(), {
        currentPlayerId: 1,
        action: "invalidated",
        isGameOver: false
      });
    });

    it("should throw an error if the card invalidated is not present in the suspicion combination", () => {
      const MUSTARD = { type: "suspect", title: "mustard" };

      const gourab = createPlayer(1, "gourab", [], "mustard", { x: 1, y: 4 });
      const sauma = createPlayer(2, "sauma", [MUSTARD], "scarlet", {
        x: 0,
        y: 8
      });
      const players = new Players([gourab, sauma]);
      const game = new Game({ players });
      game.start();
      game.validateSuspicion(1, { weapon: "dagger", suspect: "mustard" });

      assert.throws(() => game.invalidateSuspicion(2, "plum"), {
        message: "Card not present"
      });
    });
  });

  describe("getLastSuspicion", () => {
    it("should give the last suspicion info", () => {
      const gourab = createPlayer(1, "gourab", [], "mustard", { x: 1, y: 4 });
      const players = new Players([gourab]);
      const game = new Game({ players });
      game.start();

      game.validateSuspicion(1, { weapon: "dagger", suspect: "mustard" });

      assert.deepStrictEqual(game.getLastSuspicion(), {
        combination: {
          suspect: "mustard",
          weapon: "dagger"
        },
        suspectorId: 1
      });
    });
  });

  describe("cancelAccusation", () => {
    it("should cancel the accusation done by the current player", () => {
      const gourab = createPlayer(1, "gourab", [], "mustard", { x: 1, y: 4 });
      const players = new Players([gourab]);
      const game = new Game({ players });
      game.start();

      game.toggleIsAccusing();
      game.cancelAccusation();

      assert.deepStrictEqual(game.state(), {
        action: "accusation-cancelled",
        currentPlayerId: 1,
        isGameOver: false
      });
    });
  });
});
