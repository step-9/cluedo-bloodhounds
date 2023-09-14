class Board {
  #rooms;
  #dimensions;
  #blockedTiles;

  constructor({ dimensions, blockedTiles, rooms }) {
    this.#rooms = rooms;
    this.#dimensions = dimensions;
    this.#blockedTiles = blockedTiles;
  }

  #isInside({ x, y }) {
    const { length, breadth } = this.#dimensions;
    const isXInside = x >= 0 && x < length;
    const isYInside = y >= 0 && y < breadth;

    return isXInside && isYInside;
  }

  #isBlockedTile(tileCoordinate, playerPositions) {
    return this.#blockedTiles
      .concat(playerPositions)
      .some(({ x, y }) => x === tileCoordinate.x && y === tileCoordinate.y);
  }

  #isInsideRoom({ x, y }) {
    const rooms = Object.entries(this.#rooms);

    return rooms.some(([_, { tileRows }]) => {
      return tileRows.some(([rowStart, rowEnd]) => {
        return (
          x >= rowStart.x && x <= rowEnd.x && y >= rowStart.y && y <= rowEnd.y
        );
      });
    });
  }

  getTileInfo(tileCoordinate, playerPositions = []) {
    const info = {};

    info.isPresent = this.#isInside(tileCoordinate);
    if (!info.isPresent) return info;

    info.isBlocked = this.#isBlockedTile(tileCoordinate, playerPositions);
    if (info.isBlocked) return info;

    info.isRoomTile = this.#isInsideRoom(tileCoordinate);

    return info;
  }
}

module.exports = Board;
