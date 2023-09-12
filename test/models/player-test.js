const { describe, it } = require("node:test");
const assert = require("assert");
const Player = require("../../src/models/player");
const Card = require("../../src/models/card");

describe("Player", () => {
  describe("info", () => {
    it("should give its info", ctx => {
      const info = ctx.mock.fn(() => "mock data");
      const cards = [{ info }, { info }];
      const playerDetails = {
        name: "milan",
        id: 1,
        character: "Mustard",
        cards,
        position: { x: 5, y: 6 }
      };

      const expectedPlayerInfo = {
        cards: ["mock data", "mock data"],
        name: "milan",
        id: 1,
        character: "Mustard",
        isStranded: false,
        currentPosition: { x: 5, y: 6 },
        lastSuspicionPosition: null
      };

      const player = new Player(playerDetails);

      assert.deepStrictEqual(player.info(), expectedPlayerInfo);
    });
  });

  describe("strandPlayer", () => {
    it("should strand the player", () => {
      const player = new Player({ cards: [] });
      player.strand();

      assert.ok(player.info().isStranded);
    });
  });

  describe("answerSuspicion", () => {
    it("should give the matching cards if any", () => {
      const mustard = new Card("suspect", "Mustard");
      const peacock = new Card("suspect", "Peacock");
      const lounge = new Card("room", "Lounge");

      const cards = [mustard, peacock, lounge];
      const suspicionCombination = [mustard];

      const player = new Player({ cards });

      assert.deepStrictEqual(player.answerSuspicion(suspicionCombination), [
        mustard.info()
      ]);
    });
  });
});
