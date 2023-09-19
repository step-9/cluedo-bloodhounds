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

    it("Should give all the possible positions that can reach from the doors of the room that the player is in", () => {
      const board = new Board({
        validTiles,
        rooms
      });

      const pawnPos = { x: 10, y: 19 };
      const possiblePositions = board.getPossibleTiles(2, pawnPos, [pawnPos]);
      const expectedPositions = {
        "6,19": { x: 6, y: 19 },
        "7,18": { x: 7, y: 18 },
        "7,20": { x: 7, y: 20 },
        "14,15": { x: 14, y: 15 },
        "13,16": { x: 13, y: 16 },
        "15,16": { x: 15, y: 16 }
      };

      assert.deepStrictEqual(possiblePositions, expectedPositions);
    });
  });

  describe("getPosition", () => {
    it("Should give the can move as false, when cannot reach the position", () => {
      const board = new Board({
        validTiles,
        rooms
      });

      assert.deepStrictEqual(
        board.getPosition(2, { x: 2, y: 4 }, [{ x: 2, y: 4 }], { x: 5, y: 3 }),
        {
          canMove: false
        }
      );
    });

    it("Should give the new position ", () => {
      const board = new Board({
        validTiles,
        rooms
      });

      assert.deepStrictEqual(
        board.getPosition(4, { x: 2, y: 4 }, [{ x: 2, y: 4 }], { x: 4, y: 2 }),
        {
          canMove: true,
          newPos: { x: 1, y: 2 },
          room: "study"
        }
      );
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

  it("Should give all the possible positions and rooms according to number of steps and players positions", () => {
    const board = new Board({
      validTiles,
      rooms
    });

    const pawnPos = { x: 14, y: 7 };
    const possiblePositions = board.getPossibleTiles(7, pawnPos, [pawnPos]);
    const expectedPositions = {
      "14,14": { x: 14, y: 14 },
      "15,13": { x: 15, y: 13 },
      "20,8": { x: 20, y: 8 },
      "21,7": { x: 21, y: 7 },
      "14,12": { x: 14, y: 12 },
      "15,11": { x: 15, y: 11 },
      "18,8": { x: 18, y: 8 },
      "19,7": { x: 19, y: 7 },
      "20,6": { x: 20, y: 6 },
      "14,10": { x: 14, y: 10 },
      "15,9": { x: 15, y: 9 },
      "16,8": { x: 16, y: 8 },
      "17,7": { x: 17, y: 7 },
      "18,6": { x: 18, y: 6 },
      "14,8": { x: 14, y: 8 },
      "15,7": { x: 15, y: 7 },
      "16,6": { x: 16, y: 6 },
      "15,5": { x: 15, y: 5 },
      "16,4": { x: 16, y: 4 },
      "15,3": { x: 15, y: 3 },
      "16,2": { x: 16, y: 2 },
      "8,8": { x: 8, y: 8 },
      "15,1": { x: 15, y: 1 },
      "7,7": { x: 7, y: 7 },
      "8,6": { x: 8, y: 6 },
      "17,9": { x: 17, y: 9 },
      hall: "hall",
      lounge: "lounge",
      "dining-room": "dining-room"
    };

    assert.deepStrictEqual(possiblePositions, expectedPositions);
  });
});
