const { describe, it } = require("node:test");
const assert = require("assert");
const { rollDice, cycler } = require("../../src/models/dice-roller");

describe("diceRoller", () => {
  it("should give the a dice combination cyclically", () => {
    const rolls = [
      [4, 4],
      [4, 3],
      [6, 6],
      [1, 1],
      [1, 1],
      [1, 1],
      [2, 1]
    ];

    const mockCycler = cycler(rolls);

    assert.deepStrictEqual(rollDice(mockCycler), [4, 4]);
    assert.deepStrictEqual(rollDice(mockCycler), [4, 3]);
  });
});
