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

  getPosition() {
    return this.#currentPosition;
  }

  updatePosition(newPosition) {
    this.#currentPosition = newPosition;
  }

  strand() {
    this.#isStranded = true;
    return this;
  }

  #includesCard(cardToFind) {
    return this.#cards.find(card => {
      const isTypeMatches = cardToFind.type === card.type;
      const isTitleMatches = cardToFind.title === card.title;
      return isTypeMatches && isTitleMatches;
    });
  }

  answerSuspicion(cards) {
    const matchingCards = cards.filter(card => this.#includesCard(card));
    return matchingCards;
  }

  info() {
    const cards = this.#cards;
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
