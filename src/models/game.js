class Game {
  #players;
  #currentPlayerId;

  constructor({ players }) {
    this.#players = players;
    this.#currentPlayerId = null;
  }

  getCardsOfPlayer(playerId) {
    const player = this.#players.findPlayer(+playerId);
    return player.info().cards;
  }

  changeTurn() {
    const currentPlayer = this.#players.getNextPlayer();
    this.#currentPlayerId = currentPlayer.info().id;
  }

  state() {
    return { currentPlayerId: this.#currentPlayerId };
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
