const { describe, it } = require("node:test");
const assert = require("assert");
const { chunk } = require("lodash");
const Cards = require("../../src/models/cards");

const createCardList = () => {
  const weapons = ["Dagger", "Rope", "Spanner"];
  const suspects = ["White", "Green", "Plum"];
  const rooms = ["Hall", "Study", "Library"];

  return { weapons, suspects, rooms };
};

describe("Cards", () => {
  describe("getKillingCombination", () => {
    it("should give 1 random cards of each type", context => {
      const cardList = createCardList();
      const mockShuffler = {
        random: context.mock.fn(() => 1)
      };
      const cards = new Cards(cardList, mockShuffler);

      assert.deepStrictEqual(cards.getKillingCombination(), {
        weapons: "Rope",
        suspects: "Green",
        rooms: "Study"
      });
    });
  });

  describe("shuffleRemaining", () => {
    it("should shuffle remaining cards among players", context => {
      const cardList = createCardList();
      const mockShuffler = {
        chunk,
        random: context.mock.fn(() => 1),
        shuffle: context.mock.fn(cards => cards)
      };
      const cards = new Cards(cardList, mockShuffler);
      const distributedCards = [
        ["Dagger", "Spanner", "Green", "Hall", "Library"],
        ["Rope", "White", "Plum", "Study"]
      ];

      assert.deepStrictEqual(cards.shuffleRemaining(2), distributedCards);
    });
  });
});
