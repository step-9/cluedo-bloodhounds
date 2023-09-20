class Board {
  #rooms;
  #validTiles;

  constructor({ validTiles, rooms }) {
    this.#rooms = rooms;
    this.#validTiles = validTiles;
  }

  #stringifyTile({ x, y }) {
    return `${x},${y}`;
  }

  #arePosSame(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  #isValidTile(tileCoordinates, playerPositions) {
    const tilePosition = this.#stringifyTile(tileCoordinates);
    const isValidTile = this.#validTiles.tiles[tilePosition] !== undefined;
    const isOccupied = playerPositions.some(pos =>
      this.#arePosSame(pos, tileCoordinates)
    );

    return isValidTile && !isOccupied;
  }

  #getNeighbours({ x, y }, visited) {
    const neighbours = [];
    neighbours.push({ x: x, y: y + 1 });
    neighbours.push({ x: x, y: y - 1 });
    neighbours.push({ x: x + 1, y: y });
    neighbours.push({ x: x - 1, y: y });

    return neighbours.filter(pos => this.#isValidTile(pos, visited));
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

  #isDoor(position) {
    const doors = Object.values(this.#validTiles.doors);
    return doors.some(door => this.#arePosSame(door, position));
  }

  #getPossiblePositions(startingPos, stepCount, visited) {
    if (stepCount < 0) return {};
    if (this.#isDoor(startingPos)) {
      const [room] = this.#getRoomDetails(startingPos);
      return { [room]: room };
    }
    if (stepCount === 0) {
      if (!this.#isValidTile(startingPos, visited)) return {};
      return { [this.#stringifyTile(startingPos)]: startingPos };
    }

    const stepsLeft = stepCount - 1;
    let possiblePositions = {};
    const neighbours = this.#getNeighbours(startingPos, visited);

    neighbours.forEach(pos => {
      const positions = this.#getPossiblePositions(
        pos,
        stepsLeft,
        visited.concat([startingPos])
      );

      Object.assign(possiblePositions, positions);
    });

    return possiblePositions;
  }

  #getStartingPositions(doors, playerPositions) {
    return doors
      .map(startingPosition =>
        this.#getNeighbours(startingPosition, playerPositions)
      )
      .flat();
  }

  getPossibleTiles(stepCount, currentPosition, playersPositions = []) {
    let possiblePositions = {};
    let stepsLeft = stepCount;
    let visited = playersPositions;
    let startingPositions = [currentPosition];

    const room = this.#getRoomDetails(currentPosition);
    if (room) {
      const doors = room[1].doors;
      visited = visited.concat(doors);
      startingPositions = this.#getStartingPositions(doors, playersPositions);
      stepsLeft -= 1;
    }

    startingPositions.forEach(startingPos => {
      const positions = this.#getPossiblePositions(
        startingPos,
        stepsLeft,
        visited
      );

      Object.assign(possiblePositions, positions);
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
