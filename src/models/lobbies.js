class Lobbies {
  #lobbyId;
  #lobbies;

  constructor(lobbies = {}) {
    this.#lobbyId = 0;
    this.#lobbies = lobbies;
  }

  #generateId() {
    return ++this.#lobbyId;
  }

  find(lobbyId) {
    return this.#lobbies[lobbyId];
  }

  add(lobby) {
    const id = this.#generateId();
    this.#lobbies[id] = lobby;
    return id;
  }

  destroy(lobbyId) {
    delete this.#lobbies[lobbyId];
  }
}

module.exports = Lobbies;
