class Lobby {
  #players;
  #maxPlayers;

  constructor({ maxPlayers }) {
    this.#players = [];
    this.#maxPlayers = maxPlayers || 6;
  }

  registerPlayer({ name }) {
    const noOfPlayers = this.#players.length;

    if (noOfPlayers >= this.#maxPlayers) return { isFull: true };

    this.#players.push(name);
    return { playerId: noOfPlayers + 1, isFull: false };
  }
}

module.exports = Lobby;
