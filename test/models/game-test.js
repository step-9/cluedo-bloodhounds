const { describe, it } = require("node:test");
const assert = require("assert");
const Game = require("../../src/models/game");
const Board = require("../../src/models/board");
const rooms = require("../../resources/rooms.json");
const validTiles = require("../../resources/valid-tiles.json");
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
        action: null,
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

  describe("change turn", () => {
    it("should change the current player to the next player", context => {
      const players = createPlayers();

      const game = new Game({ players });

      game.start();
      game.changeTurn();

      assert.deepStrictEqual(game.state().currentPlayerId, 1);
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

      const playerId = 1;
      game.validateAccuse(playerId, {
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
      const players = createPlayers();
      const game = new Game({ players, killingCombination });
      game.start();

      const playerId = 1;
      const playerAccusation = { ...killingCombination, suspect: "mustard" };
      const accusationResult = game.validateAccuse(playerId, playerAccusation);

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

      game.validateAccuse(1, accusingCombination);

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
      const game = new Game({ players });
      game.start();

      assert.deepStrictEqual(game.getCharacterPositions(), {
        mustard: { x: 1, y: 4 }
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
      const game = new Game({ players });

      game.start();
      const expectedPlayerInfo = {
        players: [
          {
            cards: [],
            id: 1,
            name: "gourab",
            character: "mustard",
            isStranded: false,
            currentPosition: { x: 1, y: 4 },
            lastSuspicionPosition: null
          }
        ],
        currentPlayerId: 1,
        strandedPlayerIds: [],
        characterPositions: { mustard: { x: 1, y: 4 } },
        diceRollCombination: [0, 0],
        isAccusing: false,
        isSuspecting: false,
        canAccuse: true,
        canRollDice: true,
        canMovePawn: false,
        shouldEndTurn: false
      };

      assert.deepStrictEqual(game.playersInfo(), expectedPlayerInfo);
    });
  });

  describe("findPossiblePositions", () => {
    it("Should give all the possible possitions based on the step", () => {
      const sauma = createPlayer(1, "sauma", [], "green", { x: 7, y: 5 });
      const gourab = createPlayer(2, "gourab", [], "plum", { x: 7, y: 7 });
      const players = new Players([sauma, gourab]);
      const board = new Board({ validTiles, rooms });
      const game = new Game({ players, board });

      game.start();

      const expectedPositions = {
        "8,6": { x: 8, y: 6 },
        "6,6": { x: 6, y: 6 },
        "8,4": { x: 8, y: 4 },
        "5,5": { x: 5, y: 5 },
        "6,4": { x: 6, y: 4 },
        "7,3": { x: 7, y: 3 }
      };

      assert.deepStrictEqual(game.findPossiblePositions(2), expectedPositions);
    });

    it("Should give possible positions as empty when when there is no where to move", () => {
      const sauma = createPlayer(1, "sauma", [], "green", { x: 7, y: 5 });
      const players = new Players([sauma]);
      const board = new Board({ validTiles, rooms });
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
});
