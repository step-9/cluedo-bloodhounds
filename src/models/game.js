class Game {
  #board;
  #players;
  #killingCombination;
  #currentPlayer;
  #lastAccusationCombination;
  #lastSuspicion;
  #lastDiceCombination;
  #possiblePositions;
  #action;
  #lastAction;

  #isGameWon;
  #isGameOver;
  #isAccusing;
  #isSuspecting;

  #strandedPlayerIds;

  constructor({ players, board, killingCombination }) {
    this.#board = board;
    this.#players = players;
    this.#currentPlayer = null;
    this.#strandedPlayerIds = [];
    this.#killingCombination = killingCombination;
    this.#possiblePositions = {};
    this.#action = "turnEnded";
    this.#lastDiceCombination = [0, 0];
    this.#isGameWon = this.#isGameOver = false;
    this.#isAccusing = this.#isSuspecting = false;
    this.#lastSuspicion = {};
  }

  #areAllPlayersStranded() {
    const totalPlayers = this.#players.info().length;
    const totalStrandedPlayers = this.#strandedPlayerIds.length;
    return totalPlayers === totalStrandedPlayers;
  }

  getCardsOfPlayer(playerId) {
    const player = this.#players.findPlayer(+playerId);
    return player.info().cards;
  }

  #setupPermissions() {
    this.#currentPlayer.setupInitialPermissions();

    const lastSuspicionPosition =
      this.#currentPlayer.getLastSuspicionPosition();
    const currentPlayerCharacter = this.#currentPlayer.info().character;
    const currentPosition =
      this.#board.getCharacterPositions()[currentPlayerCharacter];

    const room = this.#board.getRoomDetails(currentPosition);
    if (!room) return;

    if (room[0] !== lastSuspicionPosition) {
      this.#currentPlayer.allow("suspect");
    }
  }

  changeTurn() {
    this.#action = "turnEnded";
    this.#currentPlayer = this.#players.getNextPlayer();
    this.#setupPermissions();
  }

  toggleIsAccusing() {
    this.#isAccusing = true;
    this.#lastAction = this.#action;
    this.#action = "accusing";
    this.#currentPlayer.startAccusing();
  }

  toggleIsSuspecting() {
    this.#isSuspecting = true;
    this.#action = "suspecting";
  }

  state() {
    return {
      currentPlayerId: this.#currentPlayer.id,
      action: this.#action,
      isGameOver: this.#isGameOver
    };
  }

  movePawn(tileCoordinates, playerId) {
    const isCurrentPlayer = playerId === this.#currentPlayer.id;
    const canMovePawn = this.#currentPlayer.permissions.canMovePawn;

    if (!isCurrentPlayer || !canMovePawn) return { isMoved: false };

    const stepCount = this.#lastDiceCombination.reduce((sum, a) => sum + a, 0);

    const currentPlayerCharacter = this.#currentPlayer.info().character;

    const { hasMoved, room } = this.#board.updatePosition(
      stepCount,
      currentPlayerCharacter,
      tileCoordinates
    );

    if (hasMoved) {
      this.#currentPlayer.hasMoved();
      this.#action = "updateBoard";
      const result = { isMoved: true };
      this.#currentPlayer.updateLastSuspicionPosition("");

      if (room) {
        result.canSuspect = true;
        result.room = room;
        this.#currentPlayer.updateLastSuspicionPosition(room);
      }

      return result;
    }

    return { isMoved: false };
  }

  playersInfo() {
    const permissions = this.#currentPlayer.permissions;

    return {
      players: this.#players.info(),
      currentPlayerId: this.#currentPlayer.id,
      strandedPlayerIds: this.#strandedPlayerIds,
      characterPositions: this.#board.getCharacterPositions(),
      diceRollCombination: this.#lastDiceCombination,
      isAccusing: this.#isAccusing,
      isSuspecting: this.#isSuspecting,
      ...permissions
    };
  }

  getLastAccusationCombination() {
    return this.#lastAccusationCombination;
  }

  getLastSuspicionCombination() {
    return this.#lastSuspicion.combination;
  }

  validateSuspicion(playerId, suspicionCombination) {
    this.#lastSuspicion.combination = suspicionCombination;
    this.#lastSuspicion.suspectorId = playerId;
    this.#action = "suspected";
  }

  ruleOutSuspicion() {
    const suspicionCombination = Object.entries(
      this.#lastSuspicion.combination
    ).map(([type, title]) => ({ type, title }));

    return this.#players.ruleOutSuspicion(
      this.#currentPlayer.id,
      suspicionCombination
    );
  }

  getGameOverInfo() {
    return {
      killingCombination: this.#killingCombination,
      isGameWon: this.#isGameWon
    };
  }

  getLastDiceCombination() {
    return this.#lastDiceCombination;
  }

  move(suspect, room) {
    this.#board.move(suspect, room);
  }

  validateAccuse(playerId, combination) {
    this.#lastAccusationCombination = combination;
    const killingCombinationCards = Object.entries(this.#killingCombination);

    this.#isGameWon = killingCombinationCards.every(([type, title]) => {
      return title === combination[type];
    });

    this.#isGameOver = this.#isGameWon;

    if (!this.#isGameWon) {
      this.#strandedPlayerIds.push(playerId);
      this.#players.strandPlayer(playerId);
      this.#isGameOver = this.#areAllPlayersStranded();
    }

    this.#isAccusing = false;
    this.#action = "accused";
    this.#currentPlayer.allow("endTurn");

    return {
      isWon: this.#isGameWon,
      killingCombination: { ...this.#killingCombination }
    };
  }

  getCharacterPositions() {
    return this.#board.getCharacterPositions();
  }

  updateDiceCombination(diceCombination) {
    this.#action = "diceRolled";
    this.#currentPlayer.allow("movePawn");
    this.#currentPlayer.revoke("rollDice");
    this.#lastDiceCombination = diceCombination;
  }

  updatePossiblePositions(possiblePositions) {
    this.#possiblePositions = possiblePositions;
  }

  getPossiblePositions() {
    return this.#possiblePositions;
  }

  findPossiblePositions(stepCount) {
    const currentPlayerCharacter = this.#currentPlayer.info().character;

    const possiblePositions = this.#board.getPossibleTiles(
      stepCount,
      currentPlayerCharacter
    );

    if (Object.keys(possiblePositions).length === 0) {
      this.#currentPlayer.revoke("movePawn");
      this.#currentPlayer.allow("endTurn");
    }

    return possiblePositions;
  }

  start() {
    this.#currentPlayer = this.#players.getNextPlayer();
  }

  getLastSuspicionPosition(playerId) {
    return this.#players.getLastSuspicionPosition(playerId);
  }

  invalidateSuspicion(invalidatorId, cardTitle) {
    const { combination } = this.#lastSuspicion;
    const isCardPresent = Object.values(combination).includes(cardTitle);
    if (!isCardPresent) throw new Error("Card not present");

    this.#lastSuspicion.invalidatorId = invalidatorId;
    this.#lastSuspicion.invalidatedCard = cardTitle;
    this.#action = "invalidated";
  }

  getLastSuspicion() {
    return this.#lastSuspicion;
  }

  cancelAccusation() {
    this.#isAccusing = false;
    this.#action = this.#lastAction;
    this.#currentPlayer.cancelAccusing();
  }
}

module.exports = Game;
