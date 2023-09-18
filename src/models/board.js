class Board {
  #rooms;
  #dimensions;
  #validTiles;
  #blockedTiles;

  constructor({ dimensions, blockedTiles, rooms, validTiles }) {
    this.#rooms = rooms;
    this.#validTiles = validTiles;
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

  #isValidTile(tileCoordinates, playerPositions) {
    return (
      this.#isInside(tileCoordinates) &&
      !this.#isBlockedTile(tileCoordinates, playerPositions) &&
      !this.#isInsideRoom(tileCoordinates)
    );
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

    for (let i = 0; i <= stepCount; i++) {
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

  #arePosSame(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  #isValidNeighbour(pos, visited) {
    return (
      this.#isValidTile(pos, []) &&
      !visited.some(pos2 => this.#arePosSame(pos, pos2))
    );
  }

  #getNeighbours({ x, y }, visited) {
    const neighbours = [];
    neighbours.push({ x: x, y: y + 1 });
    neighbours.push({ x: x, y: y - 1 });
    neighbours.push({ x: x + 1, y: y });
    neighbours.push({ x: x - 1, y: y });

    return neighbours.filter(pos => this.#isValidNeighbour(pos, visited));
  }

  #isPathExists(from, to, stepCount, visited) {
    if (stepCount < 0) return false;
    if (this.#arePosSame(from, to) && stepCount === 0) return true;
    const stepsLeft = stepCount - 1;

    const neighbours = this.#getNeighbours(from, visited);
    return neighbours.some(pos =>
      this.#isPathExists(pos, to, stepsLeft, [...visited, from])
    );
  }

  getPossibleTiles(stepCount, currentPosition, playersPositions = []) {
    const possiblePositions = {};

    this.#calculateAllPossiblePos(stepCount, currentPosition).forEach(pos => {
      if (this.#isValidTile(pos, playersPositions)) {
        const isPathExists = this.#isPathExists(
          currentPosition,
          pos,
          stepCount,
          playersPositions
        );

        if (isPathExists) possiblePositions[`${pos.x},${pos.y}`] = pos;
      }
    });

    return possiblePositions;
  }
}

module.exports = Board;
