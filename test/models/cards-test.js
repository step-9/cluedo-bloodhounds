const { describe, it } = require("node:test");
const assert = require("assert");
const { chunk } = require("lodash");
const Cards = require("../../src/models/cards");

const createCardList = () => {
  const weapons = [
    { type: "weapon", title: "dagger" },
    { type: "weapon", title: "rope" },
    { type: "weapon", title: "spanner" }
  ];
  const suspects = [
    { type: "suspect", title: "white" },
    { type: "suspect", title: "green" },
    { type: "suspect", title: "plum" }
  ];
  const rooms = [
    { type: "room", title: "hall" },
    { type: "room", title: "study" },
    { type: "room", title: "library" }
  ];

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
        [
          { type: "weapon", title: "dagger" },
          { type: "weapon", title: "spanner" },
          { type: "suspect", title: "green" },
          { type: "room", title: "hall" },
          { type: "room", title: "library" }
        ],
        [
          { type: "weapon", title: "rope" },
          { type: "suspect", title: "white" },
          { type: "suspect", title: "plum" },
          { type: "room", title: "study" }
        ]
      ];

      assert.deepStrictEqual(cards.shuffleRemaining(2), distributedCards);
    });
  });
});
