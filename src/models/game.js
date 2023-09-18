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
  #action;
  #lastAccusationCombination;

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
    this.#shouldEndTurn = false;
    this.#killingCombination = killingCombination;
    this.#action = null;
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
    this.#action = "turnEnded";
  }

  toggleIsAccusing() {
    this.#isAccusing = !this.#isAccusing;
    this.#action = "accusing";
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

  #getOccupiedPositions() {
    return Object.values(this.#players.getCharacterPositions());
  }

  movePawn(tileCoordinates, playerId) {
    const isCurrentPlayer = playerId === this.#currentPlayerId;
    if (!isCurrentPlayer || !this.#isPlayerMovable) return { isMoved: false };

    const occupiedPositions = this.#getOccupiedPositions();
    const tileInfo = this.#board.getTileInfo(
      tileCoordinates,
      occupiedPositions
    );

    if ("isRoomTile" in tileInfo) {
      if (tileInfo.isRoomTile === false) {
        this.#isPlayerMovable = false;
        this.#shouldEndTurn = true;
        this.#canAccuse = true;
        this.#players.updatePlayerPosition(playerId, tileCoordinates);
        this.#action = "updateBoard";
        return { isMoved: true };
      }
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
      characterPositions: this.#players.getCharacterPositions()
    };
  }

  getCharacterPositions() {
    return this.#players.getCharacterPositions();
  }

  getLastAccusationCombination() {
    return this.#lastAccusationCombination;
  }

  getGameOverInfo() {
    return {
      killingCombination: this.#killingCombination,
      isGameWon: this.#isGameWon
    };
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
    this.#action = "accused";

    return {
      isWon: this.#isGameWon,
      killingCombination: { ...this.#killingCombination }
    };
  }

  start() {
    const currentPlayer = this.#players.getNextPlayer();
    this.#currentPlayerId = currentPlayer.info().id;
  }
}

module.exports = Game;
