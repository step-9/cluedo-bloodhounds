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
    it("Should give the current player id as the game state", context => {
      const player = {
        info: context.mock.fn(() => ({ id: 1 }))
      };
      const players = {
        getNextPlayer: context.mock.fn(() => player)
      };
      const game = new Game({ players });

      game.start();

      assert.deepStrictEqual(game.state(), {
        currentPlayerId: 1,
        isAccusing: false
      });
    });
  });

  describe("change turn", () => {
    it("should change the current player to the next player", context => {
      const player = {
        info: context.mock.fn(() => ({ id: 1 }))
      };
      const players = {
        getNextPlayer: context.mock.fn(() => player)
      };
      const game = new Game({ players });

      game.start();
      game.changeTurn();

      assert.deepStrictEqual(game.state(), {
        currentPlayerId: 1,
        isAccusing: false
      });
    });
  });

  describe("toggleIsAccusing", () => {
    it("should toggle the isAccusing status", context => {
      const game = new Game({ players: {} });
      game.toggleIsAccusing();

      assert.ok(game.state().isAccusing);
    });
  });
});
