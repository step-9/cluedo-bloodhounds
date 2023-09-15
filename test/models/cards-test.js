const { describe, it } = require("node:test");
const assert = require("assert");
const { chunk } = require("lodash");
const Cards = require("../../src/models/cards");

const createCardList = () => {
  const weapons = ["dagger", "rope", "spanner"];
  const suspects = ["white", "green", "plum"];
  const rooms = ["hall", "study", "library"];

  return { weapons, suspects, rooms };
};

describe("cards", () => {
  describe("getKillingCombination", () => {
    it("should give 1 random cards of each type", context => {
      const cardList = createCardList();
      const mockShuffler = {
        random: context.mock.fn(() => 1)
      };
      const cards = new Cards(cardList, mockShuffler);

      assert.deepStrictEqual(cards.getKillingCombination(), {
        weapons: "rope",
        suspects: "green",
        rooms: "study"
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
        ["dagger", "spanner", "green", "hall", "library"],
        ["rope", "white", "plum", "study"]
      ];

      assert.deepStrictEqual(cards.shuffleRemaining(2), distributedCards);
    });
  });
});
