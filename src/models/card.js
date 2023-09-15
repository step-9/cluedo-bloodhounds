const isEqualString = (a, b) => a.toLowerCase() === b.toLowerCase();

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
    const matchesTitle = isEqualString(this.#title, anotherCard.#title);
    const matchesType = isEqualString(this.#type, anotherCard.#type);

    return matchesTitle && matchesType;
  }
}

module.exports = Card;
