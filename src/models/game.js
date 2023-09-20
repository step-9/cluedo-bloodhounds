class Game {
  #board;
  #players;
  #currentPlayerId;
  #isAccusing;
  #isGameWon;
  #isGameOver;
  #strandedPlayerIds;
  #isPlayerMovable;
  #shouldEndTurn;
  #killingCombination;
  #canAccuse;
  #canRollDice;
  #action;
  #lastAccusationCombination;
  #lastSuspicionCombination;
  #lastDiceCombination;
  #possiblePositions;
  #canMovePawn;
  #isSuspecting;

  constructor({ players, board, killingCombination }) {
    this.#board = board;
    this.#players = players;
    this.#currentPlayerId = null;
    this.#isAccusing = false;
    this.#isGameWon = false;
    this.#isGameOver = false;
    this.#strandedPlayerIds = [];
    this.#isPlayerMovable = true;
    this.#canAccuse = true;
    this.#canRollDice = true;
    this.#shouldEndTurn = false;
    this.#canMovePawn = false;
    this.#killingCombination = killingCombination;
    this.#possiblePositions = {};
    this.#action = null;
    this.#isSuspecting = false;
    this.#lastDiceCombination = [0, 0];
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

  changeTurn() {
    const currentPlayer = this.#players.getNextPlayer();
    this.#currentPlayerId = currentPlayer.info().id;
    this.#isPlayerMovable = true;
    this.#canAccuse = true;
    this.#shouldEndTurn = false;
    this.#canRollDice = true;
    this.#canMovePawn = false;
    this.#action = "turnEnded";
  }

  toggleIsAccusing() {
    this.#isAccusing = !this.#isAccusing;
    this.#action = "accusing";
  }

  toggleIsSuspecting() {
    this.#isSuspecting = !this.#isSuspecting;
    this.#action = "suspecting";
  }

  setAction(action) {
    this.#action = action;
  }

  state() {
    return {
      currentPlayerId: this.#currentPlayerId,
      action: this.#action,
      isGameOver: this.#isGameOver
    };
  }

  movePawn(tileCoordinates, playerId) {
    const isCurrentPlayer = playerId === this.#currentPlayerId;
    if (!isCurrentPlayer || !this.#isPlayerMovable) return { isMoved: false };
    const stepCount = this.#lastDiceCombination.reduce((sum, a) => sum + a, 0);

    const currentPlayerPos = this.#players.getPlayerPosition(
      this.#currentPlayerId
    );
    const characterPositions = Object.values(
      this.#players.getCharacterPositions()
    );

    const { canMove, newPos, room } = this.#board.getPosition(
      stepCount,
      currentPlayerPos,
      characterPositions,
      tileCoordinates
    );

    if (canMove) {
      this.#isPlayerMovable = false;
      this.#shouldEndTurn = true;
      this.#canAccuse = true;
      this.#players.updatePlayerPosition(playerId, newPos);
      this.#action = "updateBoard";
      const result = { isMoved: true };

      if (room) {
        result.canSuspect = true;
        result.room = room;
      }

      return result;
    }

    return { isMoved: false };
  }

  playersInfo() {
    return {
      players: this.#players.info(),
      currentPlayerId: this.#currentPlayerId,
      strandedPlayerIds: this.#strandedPlayerIds,
      canAccuse: this.#canAccuse,
      shouldEndTurn: this.#shouldEndTurn,
      characterPositions: this.#players.getCharacterPositions(),
      diceRollCombination: this.#lastDiceCombination,
      canRollDice: this.#canRollDice,
      canMovePawn: this.#canMovePawn,
      isSuspecting: this.#isSuspecting
    };
  }

  getLastAccusationCombination() {
    return this.#lastAccusationCombination;
  }

  getLastSuspicionCombination() {
    return this.#lastSuspicionCombination;
  }

  validateSuspicion(playerId, suspicionCombination) {
    this.#lastSuspicionCombination = suspicionCombination;
    this.#action = "suspected";
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
    this.#shouldEndTurn = true;
    this.#canAccuse = false;
    this.#canRollDice = false;
    this.#canMovePawn = false;
    this.#action = "accused";

    return {
      isWon: this.#isGameWon,
      killingCombination: { ...this.#killingCombination }
    };
  }

  getCharacterPositions() {
    return this.#players.getCharacterPositions();
  }

  updateDiceCombination(diceCombination) {
    this.#lastDiceCombination = diceCombination;
    this.#action = "diceRolled";
    this.#canRollDice = false;
    this.#canMovePawn = true;
  }

  updatePossiblePositions(possiblePositions) {
    this.#possiblePositions = possiblePositions;
  }

  getPossiblePositions() {
    return this.#possiblePositions;
  }

  findPossiblePositions(stepCount) {
    const currentPlayerPos = this.#players.getPlayerPosition(
      this.#currentPlayerId
    );
    const characterPositions = Object.values(
      this.#players.getCharacterPositions()
    );

    const possiblePositions = this.#board.getPossibleTiles(
      stepCount,
      currentPlayerPos,
      characterPositions
    );

    if (Object.keys(possiblePositions).length === 0) {
      this.#canMovePawn = false;
      this.#shouldEndTurn = true;
    }

    return possiblePositions;
  }

  start() {
    const currentPlayer = this.#players.getNextPlayer();
    this.#currentPlayerId = currentPlayer.info().id;
  }
}

module.exports = Game;
