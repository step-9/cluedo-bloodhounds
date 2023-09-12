const toCardInfo = card => card.info();

class Player {
  #id;
  #name;
  #cards;
  #isStranded;
  #character;
  #currentPosition;
  #lastSuspicionPosition;

  constructor({ name, id, character, cards, position }) {
    this.#name = name;
    this.#id = id;
    this.#character = character;
    this.#cards = cards;
    this.#currentPosition = position;
    this.#lastSuspicionPosition = null;
    this.#isStranded = false;
  }

  strand() {
    this.#isStranded = true;
    return this;
  }

  #includesCard(cardToFind) {
    return this.#cards.find(card => card.matches(cardToFind));
  }

  answerSuspicion(cards) {
    const matchingCards = cards.filter(card => this.#includesCard(card));
    return matchingCards.map(toCardInfo);
  }

  info() {
    const cards = this.#cards.map(toCardInfo);
    return {
      cards,
      id: this.#id,
      name: this.#name,
      character: this.#character,
      isStranded: this.#isStranded,
      currentPosition: this.#currentPosition,
      lastSuspicionPosition: this.#lastSuspicionPosition
    };
  }
}

module.exports = Player;
