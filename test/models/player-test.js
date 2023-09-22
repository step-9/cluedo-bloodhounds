const { describe, it } = require("node:test");
const assert = require("assert");
const Player = require("../../src/models/player");

describe("Player", () => {
  describe("info", () => {
    it("should give its info", ctx => {
      const info = ctx.mock.fn(() => "mock data");
      const cards = ["mock data", "mock data"];
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
      const mustard = { type: "suspect", title: "mustard" };
      const peacock = { type: "suspect", title: "peacock" };
      const lounge = { type: "room", title: "lounge" };

      const cards = [mustard, peacock, lounge];
      const suspicionCombination = [mustard];

      const player = new Player({ cards });

      assert.deepStrictEqual(player.answerSuspicion(suspicionCombination), [
        mustard
      ]);
    });
  });

  describe("hasMoved", () => {
    it("should not allow player to move pawn", () => {
      const player = new Player({ cards: [] });
      player.hasMoved();

      assert.ok(!player.permissions.canMovePawn);
    });
  });
});
