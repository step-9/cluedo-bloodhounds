const { describe, it } = require("node:test");
const assert = require("assert");
const { createCards } = require("../../src/utils/card-generator");
const Card = require("../../src/models/card");

describe("createCards", () => {
  it("Should create cards with the provided card info", () => {
    const cardsInfo = {
      suspect: [],
      weapon: ["Dagger"],
      room: ["Lounge"]
    };

    const cardsLookup = createCards(cardsInfo);

    const [dagger] = cardsLookup.weapon;
    const [lounge] = cardsLookup.room;

    assert.deepStrictEqual(dagger.info(), { type: "weapon", title: "Dagger" });
    assert.deepStrictEqual(lounge.info(), {
      type: "room",
      title: "Lounge"
    });
  });
});
