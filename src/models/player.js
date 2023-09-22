class Player {
  #id;
  #name;
  #cards;
  #character;

  #isStranded;
  #permissions;
  #lastSuspicionPosition;

  constructor({ name, id, character, cards }) {
    this.#id = id;
    this.#name = name;
    this.#cards = cards;
    this.#character = character;

    this.#permissions = {};
    this.#isStranded = false;
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

  hasMoved() {
    this.#permissions.movePawn = false;
    this.#permissions.endTurn = true;
    this.#permissions.accuse = true;
  }

  startAccusing() {
    const permissionsToRevoke = ["accuse", "rollDice", "movePawn"];
    permissionsToRevoke.forEach(permission => this.revoke(permission));

    this.allow("endTurn");
  }

  info() {
    const cards = this.#cards;
    return {
      cards,
      id: this.#id,
      name: this.#name,
      character: this.#character,
      isStranded: this.#isStranded,
      lastSuspicionPosition: this.#lastSuspicionPosition
    };
  }
}

module.exports = Player;
