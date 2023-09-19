class Board {
  //eslint-disable-next-line no-unused-private-class-members
  #rooms;
  #validTiles;

  constructor({ validTiles, rooms }) {
    this.#rooms = rooms;
    this.#validTiles = validTiles;
  }

  #stringifyTile({ x, y }) {
    return `${x},${y}`;
  }

  #isValidTile(tileCoordinates, playerPositions) {
    const tilePosition = this.#stringifyTile(tileCoordinates);
    const isValidTile = this.#validTiles.tiles[tilePosition] !== undefined;
    const isOccupied = playerPositions.some(pos =>
      this.#arePosSame(pos, tileCoordinates)
    );

    return isValidTile && !isOccupied;
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
