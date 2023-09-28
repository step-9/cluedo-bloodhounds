class Board {
  #rooms;
  #staircase;
  #validTiles;
  #characterPositions;

  constructor({ validTiles, rooms, staircase, initialPositions }) {
    this.#rooms = rooms;
    this.#staircase = staircase;
    this.#validTiles = validTiles;
    this.#characterPositions = initialPositions;
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

  getRoomDetails({ x, y }) {
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
    if (this.#isDoor(startingPos)) {
      const [room] = this.getRoomDetails(startingPos);
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

  move(suspect, roomName) {
    const roomInfo = this.#rooms[roomName];

    const newPos = this.#getNextPos(roomInfo);
    this.#characterPositions[suspect] = newPos;
  }

  moveToStaircase(strandedCharacter) {
    const newPos = this.#getNextPos(this.#staircase);
    this.#characterPositions[strandedCharacter] = newPos;
  }

  getPossibleTiles(stepCount, currentPlayerCharacter) {
    const playersPositions = Object.values(this.#characterPositions);

    const currentPlayerPosition =
      this.#characterPositions[currentPlayerCharacter];

    let possiblePositions = {};
    let stepsLeft = stepCount;
    let visited = playersPositions;
    let startingPositions = [currentPlayerPosition];

    const room = this.getRoomDetails(currentPlayerPosition);
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

  #getNextPos({ floorPositions }) {
    const playerPositions = Object.values(this.#characterPositions);

    return floorPositions.find(tile => {
      return !playerPositions.some(pos => this.#arePosSame(tile, pos));
    });
  }

  getCharacterPositions() {
    return this.#characterPositions;
  }

  #getConnectedRoomDetails({ x, y }, currentPlayerCharacter) {
    const rooms = Object.entries(this.#rooms);

    const room = rooms.find(
      ([_, { passage }]) =>
        passage?.coordinate?.x === x && passage?.coordinate?.y === y
    );

    const characterPosition = this.#characterPositions[currentPlayerCharacter];

    const isPlayerInsideRoom =
      this.getRoomDetails(characterPosition)?.at(0) === room?.at(0);

    if (room && isPlayerInsideRoom) {
      const connectedRoomName = room[1].passage.name;
      const connectedRoom = this.#rooms[connectedRoomName];
      return [connectedRoomName, connectedRoom];
    }

    return null;
  }

  updatePosition(stepCount, currentPlayerCharacter, destination, canRollDice) {
    let newPos = { ...destination };

    const possiblePositions = this.getPossibleTiles(
      stepCount,
      currentPlayerCharacter
    );

    const currentPos = this.#characterPositions[currentPlayerCharacter];
    const currentRoom = this.getRoomDetails(currentPos);

    if (currentRoom && canRollDice) {
      const [_, { passage }] = currentRoom;
      const isDestinationPassage =
        passage?.coordinate.x !== destination.x ||
        passage?.coordinate.y !== destination.y;

      if (isDestinationPassage) return { hasMoved: false };
    }

    const connectedRoomDetails = this.#getConnectedRoomDetails(
      destination,
      currentPlayerCharacter
    );

    if (connectedRoomDetails) {
      const [roomName, info] = connectedRoomDetails;
      newPos = this.#getNextPos(info);
      this.#characterPositions[currentPlayerCharacter] = newPos;
      return { hasMoved: true, room: roomName };
    }

    const destinationId = this.#stringifyTile(destination);

    if (possiblePositions[destinationId]) {
      this.#characterPositions[currentPlayerCharacter] = newPos;
      return { hasMoved: true };
    }

    const room = this.getRoomDetails(destination);
    if (!room) return { hasMoved: false };

    const [roomName, info] = room;
    if (possiblePositions[roomName]) {
      newPos = this.#getNextPos(info);
      this.#characterPositions[currentPlayerCharacter] = newPos;
      return { hasMoved: true, room: roomName };
    }

    return { hasMoved: false };
  }
}

module.exports = Board;
