class Player {
  #id;
  #name;
  #cards;
  #character;

  #isStranded;
  #permissions;
  #currentPosition;
  #lastSuspicionPosition;

  constructor({ name, id, character, cards, position }) {
    this.#id = id;
    this.#name = name;
    this.#cards = cards;
    this.#character = character;

    this.#permissions = {};
    this.#isStranded = false;
    this.#currentPosition = position;
    this.#lastSuspicionPosition = null;
  }

  get id() {
    return this.#id;
  }

  get permissions() {
    return {
      canAccuse: this.#permissions.accuse,
      canRollDice: this.#permissions.rollDice,
      canMovePawn: this.#permissions.movePawn,
      shouldEndTurn: this.#permissions.endTurn
    };
  }

  allow(permission) {
    this.#permissions[permission] = true;
  }

  revoke(permission) {
    this.#permissions[permission] = false;
  }

  setupInitialPermissions() {
    this.#permissions = {
      accuse: true,
      rollDice: true,
      movePawn: false,
      endTurn: false
    };

    return this;
  }

  getPosition() {
    return this.#currentPosition;
  }

  updatePosition(newPosition) {
    this.#currentPosition = newPosition;
  }

  updateLastSuspicionPosition(room) {
    this.#lastSuspicionPosition = room;
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

  lastSuspicionPosition() {
    return this.#lastSuspicionPosition;
  }

  movePawn(newPosition) {
    this.#permissions.movePawn = false;
    this.#permissions.endTurn = true;
    this.#permissions.accuse = true;

    this.#currentPosition = newPosition;
  }

  startAccusing() {
    const permissionsToRevoke = ["accuse", "rollDice", "movePawn", "endTurn"];
    permissionsToRevoke.forEach(permission => this.revoke(permission));
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
