class Lobby {
  #players;
  #maxPlayers;
  #isGameStarted;

  constructor({ maxPlayers }) {
    this.#players = [];
    this.#isGameStarted = false;
    this.#maxPlayers = maxPlayers || 6;
  }

  registerPlayer({ name }) {
    const noOfPlayers = this.#players.length;

    if (noOfPlayers >= this.#maxPlayers)
      return { isFull: true, playerId: null };

    const playerId = noOfPlayers + 1;
    this.#players.push({ playerId, name });

    return { playerId, isFull: false };
  }

  startGame(game) {
    this.#isGameStarted = true;
    game.start();
  }

  getAllPlayers() {
    const toPlayerDetails = ({ name, playerId }) => ({ name, playerId });
    return this.#players.map(toPlayerDetails);
  }

  isFull() {
    return this.#players.length >= this.#maxPlayers;
  }

  clear() {
    this.#players = [];
    this.#isGameStarted = false;
  }

  status() {
    return {
      players: this.getAllPlayers(),
      isFull: this.isFull(),
      isGameStarted: this.#isGameStarted
    };
  }
}

module.exports = Lobby;
