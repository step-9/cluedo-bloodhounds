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

  info() {
    return this.#players.map(toPlayerInfo);
  }
}

module.exports = Players;
