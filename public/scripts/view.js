class View {
  #playersContainer;
  #cardsContainer;
  #htmlGenerator;
  #listeners;
  #bottomPane;

  constructor({
    playersContainer,
    cardsContainer,
    bottomPane,
    generateElement
  }) {
    this.#playersContainer = playersContainer;
    this.#cardsContainer = cardsContainer;
    this.#htmlGenerator = generateElement;
    this.#bottomPane = bottomPane;
    this.#listeners = {};
  }

  addListener(eventName, callback) {
    this.#listeners[eventName] = callback;
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

  #createEndTurnButton() {
    return this.#htmlGenerator([
      "input",
      { type: "button", id: "end-turn-btn", value: "End Turn" },
      []
    ]);
  }

  #deleteEndTurnButton() {
    const endTurnBtn = document.querySelector("#end-turn-btn");
    if (!endTurnBtn) return;

    endTurnBtn.remove();
  }

  #renderBoard(svg) {
    const boardContainer = document.querySelector("#board");
    boardContainer.innerHTML = svg;
    const tileElements = boardContainer.querySelectorAll("rect");

    tileElements.forEach(tile => {
      tile.onclick = () => {
        this.#listeners.movePawn(tile.id);
      };
    });
  }

  setupGame({ players, cards, playerId }, boardSvg) {
    this.#renderBoard(boardSvg);
    const playersInOrder = this.#arrangePlayers(players, playerId);
    const [firstPlayer] = playersInOrder;
    firstPlayer.name = firstPlayer.name + " (you)";

    playersInOrder.forEach(player => this.#renderPlayerInfo(player));
    cards.forEach(card => this.#renderCard(card));
  }

  renderGameState({ isYourTurn }) {
    if (!isYourTurn) {
      this.#deleteEndTurnButton();
      return;
    }

    const endTurnBtn = this.#createEndTurnButton();

    endTurnBtn.onclick = () => {
      const { onEndTurn } = this.#listeners;
      onEndTurn();
    };

    this.#bottomPane.appendChild(endTurnBtn);
  }
}
