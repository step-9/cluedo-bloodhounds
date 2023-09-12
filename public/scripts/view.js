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

  #renderPlayerInfo({ name, playerId, character }) {
    const playerInfoElement = this.#htmlGenerator([
      "div",
      { class: "player-info", id: playerId },
      [
        ["div", { class: `icon ${character}` }, character],
        ["div", { class: "name" }, name],
        ["div", { class: "message hide" }, []]
      ]
    ]);

    this.#playersContainer.appendChild(playerInfoElement);
  }

  #renderCard({ title }) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.innerText = title;

    this.#cardsContainer.appendChild(cardElement);
  }

  setupGame({ players, cards }) {
    players.forEach(player => this.#renderPlayerInfo(player));
    cards.forEach(card => this.#renderCard(card));
  }
}
