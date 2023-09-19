const assert = require("assert");
const { describe, it } = require("node:test");
const Board = require("../../src/models/board");
const rooms = require("../../resources/rooms.json");
const validTiles = require("../../resources/valid-tiles.json");

describe("Board", () => {
  describe("getPossibleTiles", () => {
    it("Should give all the possible positions according to number of steps", () => {
      const board = new Board({
        validTiles,
        rooms
      });

      const pawnPos = { x: 7, y: 5 };
      const possiblePositions = board.getPossibleTiles(1, pawnPos);
      const expectedPositions = {
        "7,6": { x: 7, y: 6 },
        "7,4": { x: 7, y: 4 },
        "8,5": { x: 8, y: 5 },
        "6,5": { x: 6, y: 5 }
      };

      assert.deepStrictEqual(possiblePositions, expectedPositions);
    });

    it("Should give all the possible positions according to number of steps", () => {
      const board = new Board({
        validTiles,
        rooms
      });

      const pawnPos = { x: 7, y: 5 };
      const possiblePositions = board.getPossibleTiles(2, pawnPos, [pawnPos]);
      const expectedPositions = {
        "7,7": { x: 7, y: 7 },
        "8,6": { x: 8, y: 6 },
        "6,6": { x: 6, y: 6 },
        "8,4": { x: 8, y: 4 },
        "5,5": { x: 5, y: 5 },
        "6,4": { x: 6, y: 4 },
        "7,3": { x: 7, y: 3 }
      };

      assert.deepStrictEqual(possiblePositions, expectedPositions);
    });
  });
});

it("Should give all the possible positions according to number of steps and players positions", () => {
  const board = new Board({
    validTiles,
    rooms
  });

  const pawnPos = { x: 7, y: 5 };
  const possiblePositions = board.getPossibleTiles(2, pawnPos, [
    pawnPos,
    { x: 7, y: 7 }
  ]);
  const expectedPositions = {
    "8,6": { x: 8, y: 6 },
    "6,6": { x: 6, y: 6 },
    "8,4": { x: 8, y: 4 },
    "5,5": { x: 5, y: 5 },
    "6,4": { x: 6, y: 4 },
    "7,3": { x: 7, y: 3 }
  };

  assert.deepStrictEqual(possiblePositions, expectedPositions);
});
