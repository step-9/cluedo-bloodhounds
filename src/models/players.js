const toPlayerInfo = player => player.info();

class Players {
  #players;
  #currentPlayerId;

  constructor(players) {
    this.#players = players;
    this.#currentPlayerId = 0;
  }

  getNextPlayer() {
    const noOfPlayers = this.#players.length;
    this.#currentPlayerId += 1;
    const nextPlayer = this.#players[noOfPlayers % this.#currentPlayerId];

    if (nextPlayer.info().isStranded) return this.getNextPlayer();
    return nextPlayer;
  }

  findPlayer(playerId) {
    return this.#players.find(player => player.info().id === playerId);
  }

  strandPlayer(playerId) {
    const playerToStrand = this.findPlayer(playerId);

    if (!playerToStrand) return new Error("Invalid Player Id");

    playerToStrand.strand();
  }

  info() {
    return this.#players.map(toPlayerInfo);
  }
}

module.exports = Players;
