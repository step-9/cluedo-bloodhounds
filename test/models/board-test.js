const assert = require("assert");
const { describe, it } = require("node:test");
const Board = require("../../src/models/board");

describe("Board", () => {
  describe("getTileInfo", () => {
    describe("Invalid tile", () => {
      it("should be invalid tile as the x coordinate is outside the board length", () => {
        const board = new Board({
          dimensions: { length: 5, breadth: 5 }
        });

        const tileCoordinate = { x: 6, y: 3 };

        assert.deepStrictEqual(board.getTileInfo(tileCoordinate), {
          isPresent: false
        });
      });

      it("should be invalid tile as the y coordinate is outside the board breadth", () => {
        const board = new Board({
          dimensions: { length: 5, breadth: 5 }
        });

        const tileCoordinate = { x: 2, y: 9 };

        assert.deepStrictEqual(board.getTileInfo(tileCoordinate), {
          isPresent: false
        });
      });
    });

    describe("Blocked tile", () => {
      it("should be blocked if the tile is present in blocked tiles", () => {
        const board = new Board({
          dimensions: { length: 5, breadth: 5 },
          blockedTiles: [
            { x: 1, y: 2 },
            { x: 3, y: 4 }
          ]
        });

        const tileCoordinate = { x: 3, y: 4 };

        assert.deepStrictEqual(board.getTileInfo(tileCoordinate, []), {
          isPresent: true,
          isBlocked: true
        });
      });
    });
  });

  describe("Room tile", () => {
    it("should be room tile as the tile is present inside the rooms", () => {
      const board = new Board({
        dimensions: { length: 24, breadth: 25 },
        blockedTiles: [],
        rooms: {
          kitchen: {
            passage: "study",
            doors: [{ x: 19, y: 18 }],
            tileRows: [
              [
                { x: 18, y: 18 },
                { x: 23, y: 18 }
              ]
            ]
          }
        }
      });

      const tileCoordinate = { x: 19, y: 18 };

      assert.deepStrictEqual(board.getTileInfo(tileCoordinate, []), {
        isPresent: true,
        isBlocked: false,
        isRoomTile: true
      });
    });
  });
});
