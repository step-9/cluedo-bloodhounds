const { describe, it } = require("node:test");
const assert = require("assert");
const Card = require("../../src/models/card");

describe("Card", () => {
  describe("info", () => {
    it("Should show its info", () => {
      const card = new Card("room", "lounge");
      const expectedCardInfo = { type: "room", title: "lounge" };

      assert.deepStrictEqual(card.info(), expectedCardInfo);
    });
  });

  describe("matches", () => {
    it("Should match for same card", () => {
      const card1 = new Card("room", "lounge");
      const card2 = new Card("room", "lounge");

      assert.ok(card1.matches(card2));
    });

    it("Should not match for another card with different title", () => {
      const card1 = new Card("room", "lounge");
      const card2 = new Card("room", "conservatory");

      assert.strictEqual(card1.matches(card2), false);
    });

    it("Should not match for another card with different type", () => {
      const card1 = new Card("room", "lounge");
      const card2 = new Card("suspect", "white");

      assert.strictEqual(card1.matches(card2), false);
    });
  });
});
