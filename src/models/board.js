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

  #getRoomDetails({ x, y }) {
    const rooms = Object.entries(this.#rooms);

    return rooms.find(([_, { tileRows }]) => {
      return tileRows.some(([rowStart, rowEnd]) => {
        return (
          x >= rowStart.x && x <= rowEnd.x && y >= rowStart.y && y <= rowEnd.y
        );
      });
    });
  }

  #canReachEntrance(from, to, stepCount, visited) {
    if (stepCount < 0) return false;

    if (this.#arePosSame(from, to) && stepCount >= 0) return true;
    const stepsLeft = stepCount - 1;

    const neighbours = this.#getNeighbours(from, visited);
    return neighbours.some(pos =>
      this.#canReachEntrance(pos, to, stepsLeft, [...visited, from])
    );
  }

  getPossibleTiles(stepCount, currentPosition, playersPositions = []) {
    const possiblePositions = {};
    let startingPositions = [currentPosition];
    const room = this.#getRoomDetails(currentPosition);
    if (room) startingPositions = room[1].doors;

    startingPositions.forEach(startingPos =>
      this.#calculateAllPossiblePos(stepCount, startingPos).forEach(pos => {
        if (this.#isValidTile(pos, playersPositions)) {
          const isPathExists = this.#isPathExists(
            startingPos,
            pos,
            stepCount,
            playersPositions
          );

          if (isPathExists) possiblePositions[`${pos.x},${pos.y}`] = pos;
        }
      })
    );

    const doors = Object.values(this.#validTiles.doors);
    doors.forEach(({ x, y, room }) => {
      if (possiblePositions[room]) return;
      const doorPos = { x, y };

      const canReachEntrance = this.#canReachEntrance(
        currentPosition,
        doorPos,
        stepCount,
        playersPositions
      );

      if (canReachEntrance) possiblePositions[room] = room;
    });

    return possiblePositions;
  }

  #getNextPos({ floorPositions }, playerPositions) {
    return floorPositions.find(tile => {
      return !playerPositions.some(pos => this.#arePosSame(tile, pos));
    });
  }

  getPosition(stepCount, currentPlayerPos, playersPositions, destination) {
    let newPos = { ...destination };
    const possiblePositions = this.getPossibleTiles(
      stepCount,
      currentPlayerPos,
      playersPositions
    );

    const destinationId = this.#stringifyTile(destination);
    if (possiblePositions[destinationId]) return { canMove: true, newPos };

    const room = this.#getRoomDetails(destination);
    if (!room) return { canMove: false };

    if (possiblePositions[room[0]]) {
      newPos = this.#getNextPos(room[1], playersPositions);
      return { canMove: true, newPos, room: room[0] };
    }

    return { canMove: false };
  }
}

module.exports = Board;
