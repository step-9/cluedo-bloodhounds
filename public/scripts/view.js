class View {
  #playersContainer;
  #cardsContainer;
  #htmlGenerator;

  constructor(playersContainer, cardsContainer, htmlGenerator) {
    this.#playersContainer = playersContainer;
    this.#cardsContainer = cardsContainer;
    this.#htmlGenerator = htmlGenerator;
  }

  #renderPlayerInfo({ name, id, character }) {
    const playerInfoElement = this.#htmlGenerator([
      "div",
      { class: "player-info", id },
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

  #arrangePlayers(players, playerId) {
    const indexOfPlayer = players.findIndex(({ id }) => id === playerId);
    const playersInOrder = players.slice(indexOfPlayer);
    playersInOrder.push(...players.slice(0, indexOfPlayer));

    return playersInOrder;
  }

  setupGame({ players, cards, playerId }) {
    const playersInOrder = this.#arrangePlayers(players, playerId);
    const [firstPlayer] = playersInOrder;
    firstPlayer.name = firstPlayer.name + " (you)"; 

    playersInOrder.forEach(player => this.#renderPlayerInfo(player));
    cards.forEach(card => this.#renderCard(card));
  }
}
