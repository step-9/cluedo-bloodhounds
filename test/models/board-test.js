const assert = require("assert");
const { describe, it } = require("node:test");
const Board = require("../../src/models/board");
const rooms = require("../../resources/rooms.json");
const validTiles = require("../../resources/valid-tiles.json");
const initialPositions = require("../../resources/initial-positions.json");

describe("Board", () => {
  describe("getPossibleTiles", () => {
    it("Should give all the possible positions according to number of steps", () => {
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      const possiblePositions = board.getPossibleTiles(1, "scarlet");
      const expectedPositions = { "16,1": { x: 16, y: 1 } };

      assert.deepStrictEqual(possiblePositions, expectedPositions);
    });

    it("Should give all the possible positions according to number of steps", () => {
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      const possiblePositions = board.getPossibleTiles(2, "mustard");
      const expectedPositions = {
        "22,8": { x: 22, y: 8 },
        "22,6": { x: 22, y: 6 },
        "21,7": { x: 21, y: 7 }
      };

      assert.deepStrictEqual(possiblePositions, expectedPositions);
    });

    it("Should give all the possible positions according to number of steps and players positions", () => {
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      const possiblePositions = board.getPossibleTiles(2, "white");
      const expectedPositions = { "15,23": { x: 15, y: 23 } };

      assert.deepStrictEqual(possiblePositions, expectedPositions);
    });

    it("Should give all the possible positions that can reach from the doors of the room that the player is in", () => {
      const initialPositions = { plum: { x: 10, y: 21 } };
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      const possiblePositions = board.getPossibleTiles(6, "plum");
      const expectedPositions = {
        "14,11": { x: 14, y: 11 },
        "15,12": { x: 15, y: 12 },
        "15,14": { x: 15, y: 14 },
        "15,16": { x: 15, y: 16 },
        "16,15": { x: 16, y: 15 },
        "14,13": { x: 14, y: 13 },
        "16,17": { x: 16, y: 17 },
        "17,16": { x: 17, y: 16 },
        "18,15": { x: 18, y: 15 },
        "12,15": { x: 12, y: 15 },
        "11,16": { x: 11, y: 16 },
        "13,16": { x: 13, y: 16 },
        "10,15": { x: 10, y: 15 },
        "14,15": { x: 14, y: 15 },
        "16,19": { x: 16, y: 19 },
        "17,18": { x: 17, y: 18 },
        "18,17": { x: 18, y: 17 },
        "19,16": { x: 19, y: 16 },
        "9,16": { x: 9, y: 16 },
        "8,23": { x: 8, y: 23 },
        "6,23": { x: 6, y: 23 },
        "6,21": { x: 6, y: 21 },
        "7,22": { x: 7, y: 22 },
        "6,19": { x: 6, y: 19 },
        "6,17": { x: 6, y: 17 },
        "7,18": { x: 7, y: 18 },
        "5,18": { x: 5, y: 18 },
        "7,14": { x: 7, y: 14 },
        "8,15": { x: 8, y: 15 },
        "6,15": { x: 6, y: 15 },
        "7,16": { x: 7, y: 16 },
        "4,17": { x: 4, y: 17 },
        "7,20": { x: 7, y: 20 },
        "3,18": { x: 3, y: 18 }
      };

      assert.deepStrictEqual(possiblePositions, expectedPositions);
    });

    it("should not give any position if step count is not valid", () => {
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      assert.deepStrictEqual(board.getPossibleTiles(0, "scarlet"), {});
    });
  });

  describe("updatePosition", () => {
    it("Should give the can move as false, when cannot reach the position", () => {
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      assert.deepStrictEqual(
        board.updatePosition(2, "scarlet", { x: 5, y: 3 }),
        {
          hasMoved: false
        }
      );
    });

    it("should move to a tile", () => {
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      assert.deepStrictEqual(
        board.updatePosition(1, "mustard", { x: 22, y: 7 }),
        { hasMoved: true }
      );
    });

    it("should not move when destination is invalid", () => {
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      assert.deepStrictEqual(
        board.updatePosition(1, "mustard", { x: -22, y: -7 }),
        { hasMoved: false }
      );
    });

    it("Should update position to new position", () => {
      const board = new Board({
        validTiles,
        rooms,
        initialPositions
      });

      assert.deepStrictEqual(
        board.updatePosition(7, "mustard", { x: 19, y: 4 }),
        {
          hasMoved: true,
          room: "lounge"
        }
      );
      assert.deepStrictEqual(board.getCharacterPositions().mustard, {
        x: 18,
        y: 1
      });
    });
  });
});
