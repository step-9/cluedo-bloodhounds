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

  getTileInfo(tileCoordinate, playersPositions = []) {
    const info = {};

    info.isPresent = this.#isInside(tileCoordinate);
    if (!info.isPresent) return info;

    info.isBlocked = this.#isBlockedTile(tileCoordinate, playersPositions);
    if (info.isBlocked) return info;

    info.isRoomTile = this.#isInsideRoom(tileCoordinate);

    return info;
  }

  #calculateAllPossiblePos(stepCount, currentPosition) {
    const positions = [];
    let x = 0;
    let y = stepCount;

    //eslint-disable-next-line id-length
    for (let i = 0; i <= stepCount; i++) {
      //eslint-disable-next-line id-length
      for (let j = 0; j <= stepCount; j++) {
        positions.push({
          x: x + j + currentPosition.x,
          y: y - j + currentPosition.y
        });
      }
      x--;
      y--;
    }

    return positions;
  }

  #isValidTile(tileCoordinates, playerPositions) {
    return (
      this.#isInside(tileCoordinates) &&
      !this.#isBlockedTile(tileCoordinates, playerPositions) &&
      !this.#isInsideRoom(tileCoordinates)
    );
  }

  getPossibleTiles(stepCount, currentPosition, playersPositions = []) {
    const possiblePositions = {};
    this.#calculateAllPossiblePos(stepCount, currentPosition).forEach(pos => {
      if (this.#isValidTile(pos, playersPositions)) {
        possiblePositions[`${pos.x},${pos.y}`] = pos;
      }
    });

    return possiblePositions;
  }
}

module.exports = Board;
