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

  findPlayerIndex(playerId) {
    return this.#players.findIndex(player => player.info().id === playerId);
  }

  getPlayerPosition(playerId) {
    const player = this.findPlayer(playerId);
    return player.getPosition();
  }

  updatePlayerPosition(playerId, newPosition) {
    const player = this.findPlayer(playerId);
    if (player) player.updatePosition(newPosition);
  }

  strandPlayer(playerId) {
    const playerToStrand = this.findPlayer(playerId);

    if (!playerToStrand) throw new Error("Invalid Player Id");

    playerToStrand.strand();
  }

  getCharacterPositions() {
    return Object.fromEntries(
      this.info().map(({ character, currentPosition }) => [
        character,
        currentPosition
      ])
    );
  }

  getLastSuspicionPosition(playerId) {
    const player = this.findPlayer(playerId);
    if (!player) throw new Error("Player not found");
    return player.lastSuspicionPosition();
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
    const suspectingPlayerIndex = this.findPlayerIndex(suspectingPlayerId);
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
}

module.exports = Players;
