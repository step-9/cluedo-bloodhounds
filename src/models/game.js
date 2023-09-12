const Player = require("./player");

class Game {
  #cards;
  #playersInfo;
  #characters;
  #players;
  #shuffler;

  constructor({ players, playersInfo, cards, characters, shuffler }) {
    this.#cards = cards;
    this.#characters = characters;
    this.#playersInfo = playersInfo;
    this.#players = players;
    this.#shuffler = shuffler;
  }

  #assignCharacters() {
    this.#playersInfo = this.#shuffler
      .shuffle(this.#playersInfo)
      .map(({ name, playerId }, playerIndex) => {
        return {
          name,
          id: +playerId,
          character: this.#characters[playerIndex]
        };
      });

    return this.#playersInfo;
  }

  getCardsOfPlayer(playerId) {
    const player = this.#players.findPlayer(+playerId);
    return player.info().cards;
  }

  #shuffleAndDistribute() {
    const shuffledCardChunks = this.#cards.shuffleRemaining(
      this.#playersInfo.length
    );

    this.#playersInfo = this.#playersInfo.map((playerInfo, playerIndex) => ({
      ...playerInfo,
      cards: shuffledCardChunks[playerIndex]
    }));
  }

  status() {
    return {
      players: this.#playersInfo
    };
  }

  start() {
    this.#playersInfo = this.#assignCharacters();
    this.#cards.getKillingCombination();
    this.#shuffleAndDistribute();
    this.#playersInfo.forEach(playerInfo =>
      this.#players.add(new Player(playerInfo))
    );
  }
}

module.exports = Game;
