function* cycle(vals) {
  let index = 0;
  while (true) {
    yield vals[index];
    index = (index + 1) % vals.length;
  }
}

class Cards {
  #shuffler;
  #remainingCards;

  constructor(cards, shuffler) {
    this.#remainingCards = cards;
    this.#shuffler = shuffler;
  }

  #pickRandomCard(type) {
    const noOfCards = this.#remainingCards[type].length;
    const randomCardIndex = this.#shuffler.random(0, noOfCards - 1);

    return this.#remainingCards[type].splice(randomCardIndex, 1);
  }

  getKillingCombination() {
    const typeCardPairs = Object.keys(this.#remainingCards).map(type => {
      const [{ title }] = this.#pickRandomCard(type);
      return [type, title];
    });

    return Object.fromEntries(typeCardPairs);
  }

  #deal(cards, noOfPlayers) {
    const hands = new Array(noOfPlayers).fill().map(() => []);
    const handCycler = cycle(hands);

    for (const card of cards) {
      const hand = handCycler.next().value;
      hand.push(card);
    }

    return hands;
  }

  shuffleRemaining(noOfPlayers) {
    const remainingCards = Object.values(this.#remainingCards).flat();
    const shuffledCards = this.#shuffler.shuffle(remainingCards);
    return this.#deal(shuffledCards, noOfPlayers);
  }
}

module.exports = Cards;
