const { describe, it } = require("node:test");
const assert = require("assert");
const Game = require("../../src/models/game");

describe("Game", () => {
  describe("start", () => {
    it("should start the game", context => {
      const playersInfo = [{ id: 1, name: "milan", cards: [] }];
      const players = {
        add: context.mock.fn(),
        info: context.mock.fn(() => "Mock Data")
      };
      const characters = ["Mustard"];
      const shuffler = { shuffle: context.mock.fn(() => playersInfo) };
      const cards = {
        getKillingCombination: context.mock.fn(),
        shuffleRemaining: context.mock.fn(() => [])
      };

      const game = new Game({
        players,
        playersInfo,
        cards,
        characters,
        shuffler
      });

      game.start();

      const expectedGameStatus = {
        players: "Mock Data"
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
});
