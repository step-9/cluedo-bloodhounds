const assert = require("assert");
const { describe, it } = require("node:test");
const Board = require("../../src/models/board");
const rooms = require("../../resources/rooms.json");
const blockedTiles = require("../../resources/blocked-tiles.json");

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

  describe("getPossibleTiles", () => {
    it("Should give all the possible positions according to number of steps", () => {
      const board = new Board({
        dimensions: { length: 24, breadth: 25 },
        blockedTiles,
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
        dimensions: { length: 24, breadth: 25 },
        blockedTiles,
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
    dimensions: { length: 24, breadth: 25 },
    blockedTiles,
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

