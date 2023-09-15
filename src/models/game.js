class Game {
  #board;
  #players;
  #currentPlayerId;
  #isAccusing;

  constructor({ players, board }) {
    this.#board = board;
    this.#players = players;
    this.#currentPlayerId = null;
    this.#isAccusing = false;
  }

  getCardsOfPlayer(playerId) {
    const player = this.#players.findPlayer(+playerId);
    return player.info().cards;
  }

  changeTurn() {
    const currentPlayer = this.#players.getNextPlayer();
    this.#currentPlayerId = currentPlayer.info().id;
  }

  toggleIsAccusing() {
    this.#isAccusing = !this.#isAccusing;
  }

  state() {
    return {
      currentPlayerId: this.#currentPlayerId,
      isAccusing: this.#isAccusing,
      characterPositions: this.#players.getCharacterPositions()
    };
  }

  movePawn(tileCoordinates, playerId) {
    console.log(tileCoordinates, playerId, this.#currentPlayerId);
    if (playerId !== this.#currentPlayerId) return { isMoved: false };

    const tileInfo = this.#board.getTileInfo(tileCoordinates);
    if ("isRoomTile" in tileInfo) {
      if (tileInfo.isRoomTile === false) return { isMoved: true };
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
