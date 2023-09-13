const Player = require("./player");

const getCharacterAssigner = characters => {
  return (playerInfo, playerIndex) => {
    return { ...playerInfo, character: characters[playerIndex] };
  };
};

const getCardsAssigner = cards => {
  return (playerInfo, playerIndex) => {
    return { ...playerInfo, cards: cards[playerIndex] };
  };
};

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
      .map(getCharacterAssigner(this.#characters));

    return this.#playersInfo;
  }

  getCardsOfPlayer(playerId) {
    const player = this.#players.findPlayer(+playerId);
    return player.info().cards;
  }

  #shuffleAndDistribute() {
    const noOfPlayers = this.#playersInfo.length;
    const shuffledCardChunks = this.#cards.shuffleRemaining(noOfPlayers);

    this.#playersInfo = this.#playersInfo.map(
      getCardsAssigner(shuffledCardChunks)
    );
  }

  status() {
    return {
      players: this.#players.info()
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
