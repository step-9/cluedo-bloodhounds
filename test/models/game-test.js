const { describe, it } = require("node:test");
const assert = require("assert");
const Game = require("../../src/models/game");

describe("Game", () => {
  describe("start", () => {
    it("should start the game", context => {
      const players = {
        add: context.mock.fn(),
        info: context.mock.fn(() => "Mock Data"),
        getCharacterPositions: context.mock.fn(),
        getNextPlayer: context.mock.fn(() => ({
          info: () => ({ id: 1 })
        }))
      };

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
      const player = {
        info: context.mock.fn(() => ({ cards: [] }))
      };
      const players = {
        findPlayer: context.mock.fn(() => player)
      };

      const game = new Game({ players });

      assert.deepStrictEqual(game.getCardsOfPlayer(1), []);
    });
  });

  describe("state", () => {
    it("Should give the current game state", context => {
      const player = {
        info: context.mock.fn(() => ({ id: 1 }))
      };
      const players = {
        getNextPlayer: context.mock.fn(() => player),
        getCharacterPositions: () => {},
        info: context.mock.fn(() => ({ id: 1 }))
      };
      const game = new Game({ players });

      game.start();

      assert.strictEqual(game.state().currentPlayerId, 1);
    });
  });

  describe("change turn", () => {
    it("should change the current player to the next player", context => {
      const player = {
        info: context.mock.fn(() => ({ id: 1 }))
      };

      const players = {
        getNextPlayer: context.mock.fn(() => player),
        getCharacterPositions: () => {},
        info: context.mock.fn(() => ({ id: 1 }))
      };

      const game = new Game({ players });

      game.start();
      game.changeTurn();

      assert.deepStrictEqual(game.state().currentPlayerId, 1);
    });
  });

  describe("toggleIsAccusing", () => {
    it("should toggle the isAccusing status", context => {
      const game = new Game({
        players: {
          getCharacterPositions: () => {},
          info: context.mock.fn(() => [])
        }
      });

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

      const game = new Game({
        players: {
          getCharacterPositions: () => {},
          strandPlayer: () => {},
          info: context.mock.fn(() => [])
        },
        killingCombination
      });

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

      const game = new Game({
        players: {
          getCharacterPositions: () => {},
          info: context.mock.fn(() => []),
          strandPlayer: context.mock.fn()
        },
        killingCombination
      });

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

      const game = new Game({
        players: {
          getCharacterPositions: () => {},
          strandPlayer: () => {},
          info: context.mock.fn(() => [])
        },
        killingCombination
      });

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

  describe("setAction", () => {
    it("Should set Action of game", () => {
      const game = new Game({});
      game.setAction("mockAction");

      assert.strictEqual(game.state().action, "mockAction");
    });
  });

  describe("getCharacterPositions", () => {
    it("Should give the current positions of all characters", context => {
      const getCharacterPositions = context.mock.fn(() => ({}));
      const players = { getCharacterPositions };
      const game = new Game({ players });

      assert.deepStrictEqual(game.getCharacterPositions(), {});
    });
  });

  describe("getLastDiceCombination", () => {
    it("Should give the last dice combination", () => {
      const game = new Game({});
      game.updateDiceCombination([4, 4]);

      assert.deepStrictEqual(game.getLastDiceCombination(), [4, 4]);
    });
  });

  describe("playersInfo", () => {
    it("Should give the players info", context => {
      const players = {
        info: context.mock.fn(() => "mockData"),
        getCharacterPositions: context.mock.fn(() => "mockData")
      };

      const game = new Game({ players });
      const expectedPlayerInfo = {
        players: "mockData",
        currentPlayerId: null,
        strandedPlayerIds: [],
        canAccuse: true,
        shouldEndTurn: false,
        characterPositions: "mockData"
      };

      assert.deepStrictEqual(game.playersInfo(), expectedPlayerInfo);
    });
  });
});
