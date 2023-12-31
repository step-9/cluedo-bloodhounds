const toPlayerInfo = player => player.info();

class Players {
  #players;
  #currentPlayerIndex;

  constructor(players = []) {
    this.#players = players;
    this.#currentPlayerIndex = -1;
  }

  add(player) {
    this.#players.push(player);
  }

  getNextPlayer() {
    const noOfPlayers = this.#players.length;
    this.#currentPlayerIndex = (this.#currentPlayerIndex + 1) % noOfPlayers;
    const nextPlayer = this.#players[this.#currentPlayerIndex];

    if (nextPlayer.info().isStranded) return this.getNextPlayer();

    return nextPlayer;
  }

  findPlayer(playerId) {
    return this.#players.find(player => player.info().id === playerId);
  }

  findPlayerWithId(playerId) {
    return this.#players.findIndex(player => player.info().id === playerId);
  }

  getLastSuspicionPosition(playerId) {
    const player = this.findPlayer(playerId);
    if (!player) throw new Error("Player not found");
    return player.getLastSuspicionPosition();
  }

  updateLastSuspicionPosition(playerId, room) {
    const player = this.findPlayer(playerId);
    if (!player) throw new Error("Player not found");
    player.updateLastSuspicionPosition(room);
  }

  info() {
    return this.#players.map(toPlayerInfo);
  }

  ruleOutSuspicion(suspectingPlayerId, suspicionCombination) {
    const suspectingPlayerIndex = this.findPlayerWithId(suspectingPlayerId);
    const totalPlayers = this.#players.length;

    let playerIndex = (suspectingPlayerIndex + 1) % totalPlayers;

    while (playerIndex !== suspectingPlayerIndex) {
      const player = this.#players[playerIndex];
      const matchingCards = player.answerSuspicion(suspicionCombination);

      if (matchingCards.length > 0) {
        return {
          invalidatedBy: player.info().id,
          matchingCards
        };
      }

      playerIndex = (playerIndex + 1) % totalPlayers;
    }

    return {};
  }

  getStrandedPlayerIds() {
    return this.#players
      .filter(player => player.info().isStranded)
      .map(player => player.id);
  }
}

module.exports = Players;
