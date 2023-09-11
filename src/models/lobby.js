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

    const playerId = noOfPlayers + 1;
    this.#players.push({ playerId, name });

    return { playerId, isFull: false };
  }

  getAllPlayers() {
    const toPlayerDetails = ({ name, playerId }) => ({ name, playerId });
    return this.#players.map(toPlayerDetails);
  }
}

module.exports = Lobby;
