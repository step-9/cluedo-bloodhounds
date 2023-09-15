const { describe, it } = require("node:test");
const assert = require("assert");
const Game = require("../../src/models/game");

describe("Game", () => {
  describe("start", () => {
    it("should start the game", context => {
      const players = {
        add: context.mock.fn(),
        info: context.mock.fn(() => "Mock Data"),
        getNextPlayer: context.mock.fn(() => ({
          info: () => ({ id: 1 })
        }))
      };

      const game = new Game({ players });

      game.start();

      const expectedGameStatus = {
        players: "Mock Data",
        currentPlayerId: 1
      };

      assert.deepStrictEqual(game.playersInfo(), expectedGameStatus);
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

  describe("status", () => {
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

      assert.ok(game.state().isAccusing);
    });
  });

  describe("validateAccuse", () => {
    it("should declare the winner and end the game as combination matches", context => {
      const mustard = { type: "suspect", title: "mustard" };
      const dagger = { type: "weapon", title: "dagger" };
      const lounge = { type: "room", title: "lounge" };

      const killingCombination = {
        weapon: dagger,
        room: lounge,
        suspect: mustard
      };

      const game = new Game({
        players: {
          getCharacterPositions: () => {},
          info: context.mock.fn(() => [])
        },
        killingCombination
      });

      const playerId = 1;
      const accusationResult = game.validateAccuse(playerId, {
        weapon: "dagger",
        room: "lounge",
        suspect: "mustard"
      });

      const expectedAccusationResult = {
        isWon: true,
        killingCombination: {
          weapon: "dagger",
          room: "lounge",
          suspect: "mustard"
        }
      };

      assert.deepStrictEqual(accusationResult, expectedAccusationResult);
    });

    it("should make the player stranded as the combination is wrong", context => {
      const mustard = { type: "suspect", title: "mustard" };
      const plum = { type: "suspect", title: "plum" };
      const lounge = { type: "room", title: "lounge" };
      const dagger = { type: "weapon", title: "dagger" };

      const killingCombination = {
        weapon: dagger,
        room: lounge,
        suspect: plum
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
      const playerAccusation = { ...killingCombination, suspect: mustard };
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
});
