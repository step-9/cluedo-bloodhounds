class Card {
  #type;
  #title;

  constructor(type, title) {
    this.#type = type;
    this.#title = title;
  }

  info() {
    return { type: this.#type, title: this.#title };
  }

  matches(anotherCard) {
    return (
      this.#title === anotherCard.#title && this.#type === anotherCard.#type
    );
  }
}

module.exports = Card;
