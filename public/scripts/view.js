class View {
  #playersContainer;
  //eslint-disable-next-line no-unused-private-class-members
  #cardsContainer;
  #htmlGenerator;

  constructor(playersContainer, cardsContainer, htmlGenerator) {
    this.#playersContainer = playersContainer;
    this.#cardsContainer = cardsContainer;
    this.#htmlGenerator = htmlGenerator;
  }

  #removeChildren(element) {
    element.innerHTML = "";
  }

  #renderPlayerInfo({ name, playerId, character }) {
    const playerInfoElement = this.#htmlGenerator([
      "div",
      { class: "player-info" },
      [
        [
          "div",
          { class: "icon-container" },
          [["div", { class: "icon red" }, []]]
        ],
        ["div", { class: "name" }, name],
        ["div", { class: "message" }, []]
      ]
    ]);

    this.#playersContainer.appendChild(playerInfoElement);
  }

  start({ players }) {
    this.#removeChildren(this.#playersContainer);
    players.forEach(player => this.#renderPlayerInfo(player));
  }
}