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
  #lastAccusationCombination;

  constructor({ players, board, killingCombination }) {
    this.#board = board;
    this.#players = players;
    this.#currentPlayerId = null;
    this.#isAccusing = false;
    this.#isGameWon = false;
    this.#isGameOver = false;
    this.#shouldEndTurn = false;
    this.#strandedPlayerIds = [];
    this.#isPlayerMovable = true;
    this.#canAccuse = true;
    this.#killingCombination = killingCombination;
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
  }

  toggleIsAccusing() {
    this.#isAccusing = !this.#isAccusing;
  }

  state() {
    const killingCombination = this.#isGameOver ? this.#killingCombination : {};

    return {
      currentPlayerId: this.#currentPlayerId,
      isAccusing: this.#isAccusing,
      isGameWon: this.#isGameWon,
      canAccuse: this.#canAccuse,
      isGameOver: this.#isGameOver,
      strandedPlayerIds: this.#strandedPlayerIds,
      killingCombination,
      shouldEndTurn: this.#shouldEndTurn,
      characterPositions: this.#players.getCharacterPositions()
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
        return { isMoved: true };
      }
    }

    return { isMoved: false };
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

    return {
      isWon: this.#isGameWon,
      killingCombination: { ...this.#killingCombination }
    };
  }

  getLastAccusationCombination() {
    return this.#lastAccusationCombination;
  }

  getCharacterPositions() {
    return this.#players.getCharacterPositions();
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

  start() {
    const currentPlayer = this.#players.getNextPlayer();
    this.#currentPlayerId = currentPlayer.info().id;
  }
}

module.exports = Game;
