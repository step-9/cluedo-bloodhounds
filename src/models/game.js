class Game {
  #board;
  #players;
  #currentPlayerId;
  #isAccusing;
  #isGameWon;
  #strandedPlayerIds;
  #isPlayerMovable;
  #shouldEndTurn;

  constructor({ players, board }) {
    this.#board = board;
    this.#players = players;
    this.#currentPlayerId = null;
    this.#isAccusing = false;
    this.#isGameWon = false;
    this.#strandedPlayerIds = [];
    this.#isPlayerMovable = true;
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
    this.#shouldEndTurn = false;
  }

  toggleIsAccusing() {
    this.#isAccusing = !this.#isAccusing;
  }

  state() {
    return {
      currentPlayerId: this.#currentPlayerId,
      isAccusing: this.#isAccusing,
      isGameWon: this.#isGameWon,
      isGameOver: this.#areAllPlayersStranded(),
      strandedPlayerIds: this.#strandedPlayerIds,
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
        this.#players.updatePlayerPosition(playerId, tileCoordinates);
        return { isMoved: true };
      }
    }

    return { isMoved: false };
  }

  playersInfo() {
    return {
      players: this.#players.info(),
      currentPlayerId: this.#currentPlayerId
    };
  }

  start() {
    const currentPlayer = this.#players.getNextPlayer();
    this.#currentPlayerId = currentPlayer.info().id;
  }
}

module.exports = Game;
