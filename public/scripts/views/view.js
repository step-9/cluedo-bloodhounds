class View {
  #listeners;
  #bottomPane;
  #popupView;
  #htmlGenerator;
  #cardsContainer;
  #playersContainer;

  constructor({
    popupView,
    bottomPane,
    cardsContainer,
    generateElement,
    playersContainer
  }) {
    this.#listeners = {};
    this.#popupView = popupView;
    this.#bottomPane = bottomPane;
    this.#cardsContainer = cardsContainer;
    this.#htmlGenerator = generateElement;
    this.#playersContainer = playersContainer;
  }

  addListener(eventName, callback) {
    this.#listeners[eventName] = callback;
  }

  #renderPlayerInfo({ name, id, character }) {
    const playerInfoElement = this.#htmlGenerator([
      "div",
      { class: "player-info", id: `player-${id}` },
      [
        ["div", { class: `icon ${character}`, id: `avatar-${id}` }, []],
        ["div", { class: "name" }, name],
        ["div", { class: "message hide", id: `message-${id}` }, []]
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

  #createButton(value, id) {
    return this.#htmlGenerator([
      "input",
      {
        type: "button",
        id,
        value,
        class: "button"
      },
      []
    ]);
  }

  #deleteButton(buttonId) {
    const button = document.querySelector(`#${buttonId}`);
    if (!button) return;

    button.remove();
  }

  #renderBoard(svg) {
    const boardContainer = document.querySelector("#board");
    boardContainer.innerHTML = svg;
    const tileElements = boardContainer.querySelectorAll("rect");
    boardContainer.classList.add("disable-click");

    tileElements.forEach(tile => {
      tile.onclick = () => {
        this.#listeners.movePawn(tile.id);
      };
    });
  }

  highlightCurrentPlayer(currentPlayerId) {
    const players = document.querySelectorAll(".icon");
    players.forEach(player => player.classList.remove("highlight"));

    const currentPlayer = document.querySelector(`#avatar-${currentPlayerId}`);
    currentPlayer.classList.add("highlight");
  }

  #isButtonPresent(buttonId) {
    return document.querySelector(`#${buttonId}`);
  }

  removeAccuseBtn() {
    const accuseBtn = document.querySelector("#accuse-btn");
    accuseBtn?.remove();
  }

  renderEndTurnButton() {
    if (this.#isButtonPresent("end-turn-btn")) return;

    const endTurnBtn = this.#createButton("End Turn", "end-turn-btn");

    endTurnBtn.onclick = () => {
      const { onEndTurn } = this.#listeners;
      onEndTurn();
      endTurnBtn?.remove();
    };

    this.#bottomPane.appendChild(endTurnBtn);
  }

  renderAccuseButton(isYourTurn, isAccusing, canAccuse) {
    const accuseDialog = document.querySelector("#accusation-popup");

    if (!isYourTurn) {
      this.#deleteButton("accuse-btn");
      return;
    }

    if (isYourTurn && isAccusing) {
      accuseDialog.showModal();
    }

    if (isYourTurn && this.#isButtonPresent("accuse-btn")) return;

    if (canAccuse) {
      const accuseBtn = this.#createButton("Accuse", "accuse-btn");

      accuseBtn.onclick = () => {
        const { startAccusation } = this.#listeners;
        accuseDialog.showModal();
        startAccusation();
        this.removeAllButtons();
      };

      this.#bottomPane.appendChild(accuseBtn);
    }
  }

  hideAllMessages() {
    const messageElements = document.querySelectorAll(".message");
    messageElements.forEach(element => element.classList.add("hide"));
  }

  renderAccusationMessage(currentPlayerId) {
    const accusingPlayer = document.querySelector(
      `#message-${currentPlayerId}`
    );

    accusingPlayer.classList.remove("hide");
    accusingPlayer.innerText = "I am Accusing";
  }

  renderSuspicionMessage(currentPlayerId) {
    const suspectingPlayer = document.querySelector(
      `#message-${currentPlayerId}`
    );

    suspectingPlayer.classList.remove("hide");
    suspectingPlayer.innerText = "I am Suspecting";
  }

  disableStrandedPlayers(strandedPlayerIds, myId) {
    strandedPlayerIds.forEach(strandedPlayerId => {
      const playerIconElement = document.querySelector(
        `#avatar-${strandedPlayerId}`
      );

      playerIconElement.classList.add("stranded-player");
    });

    if (strandedPlayerIds.includes(myId)) this.disableMove();
  }

  setupGame({ players, cards, playerId }, boardSvg) {
    this.#renderBoard(boardSvg);
    const playersInOrder = this.#arrangePlayers(players, playerId);
    const [firstPlayer] = playersInOrder;
    firstPlayer.name = firstPlayer.name + " (you)";

    playersInOrder.forEach(player => this.#renderPlayerInfo(player));
    cards.forEach(card => this.#renderCard(card));
  }

  disableMove() {
    const boardContainer = document.querySelector("#board");
    boardContainer.classList.add("disable-click");
  }

  enableMove() {
    const boardContainer = document.querySelector("#board");
    boardContainer.classList.remove("disable-click");
  }

  displayGameOver(gameOverInfo) {
    this.#popupView.displayGameOver(gameOverInfo);
  }

  notifyPlayerStranded(accuserName, accusationCombination) {
    this.#popupView.notifyPlayerStranded(accuserName, accusationCombination);
  }

  renderRollDiceButton(isYourTurn, canRollDice) {
    const rollDiceBtnId = "roll-dice-btn";
    if (this.#isButtonPresent(rollDiceBtnId)) return;

    if (isYourTurn && canRollDice) {
      const rollDiceButton = this.#createButton("Roll Dice", rollDiceBtnId);
      rollDiceButton.onclick = () => {
        this.enableMove();
        this.#listeners.rollDice();
        this.#removeRollDiceButton();
      };
      this.#bottomPane.append(rollDiceButton);
    }
  }

  setupCurrentPlayerActions({
    isYourTurn,
    canAccuse,
    shouldEndTurn,
    canRollDice
  }) {
    this.renderRollDiceButton(isYourTurn, canRollDice);
    this.renderAccuseButton(isYourTurn, false, canAccuse);

    if (isYourTurn) {
      if (shouldEndTurn) this.renderEndTurnButton();
      if (!canAccuse) this.removeAccuseBtn();
    }
  }

  setupAccuseDialog(cardsInfo) {
    this.#popupView.setupAccuseDialog(cardsInfo);
  }

  renderAccusationResult(accusationResult) {
    this.#popupView.renderAccusationResult(accusationResult);
  }

  updateCharacterPositions(characterPositions) {
    Object.entries(characterPositions).forEach(([character, { x, y }]) => {
      const pawn = `${character}-pawn`;
      const previousPositionElement = document.querySelector(`.${pawn}`);
      previousPositionElement?.classList.remove(pawn);

      const currentPositionElement = document.getElementById(`${x},${y}`);
      currentPositionElement.classList.add(pawn);
    });
  }

  removeAllButtons() {
    this.#removeRollDiceButton();
    this.removeAccuseBtn();
  }

  enableAllButtons(isYourTurn, canRollDice, canAccuse) {
    this.renderRollDiceButton(isYourTurn, canRollDice);
    this.renderAccuseButton(isYourTurn, false, canAccuse);
  }

  #removeRollDiceButton() {
    const rollDiceButton = document.querySelector("#roll-dice-btn");
    rollDiceButton?.remove();
  }

  highlightPositions(positions) {
    const tiles = Object.keys(positions);
    tiles.forEach(tile => {
      const tileElement = document.getElementById(tile);
      tileElement.classList.add("highlight-tile");
    });
  }

  disableTileHighlighting() {
    const highlightedTiles = document.querySelectorAll(".highlight-tile");
    highlightedTiles.forEach(highlightedTile =>
      highlightedTile.classList.remove("highlight-tile")
    );
  }

  renderDice(diceRollCombination) {
    const [dice1Count, dice2Count] = diceRollCombination || ["?", "?"];

    const dice1Element = document.querySelector("#dice1");
    const dice2Element = document.querySelector("#dice2");

    dice1Element.innerText = dice1Count;
    dice2Element.innerText = dice2Count;
  }

  renderSuspicionDialog(suspicionDetails) {
    this.#popupView.renderSuspicionDialog(suspicionDetails);
  }

  renderSuspicionCombination(suspicionResult) {
    this.#popupView.renderSuspicionCombination(suspicionResult);
  }

  isSuspicionDialogPresent() {
    return document.querySelector("#suspicion-popup");
  }

  setup() {
    const { playAgain, accuse, suspect } = this.#listeners;

    this.#popupView.addListener("renderEndTurnButton", () =>
      this.renderEndTurnButton()
    );
    this.#popupView.addListener("suspect", suspect);
    this.#popupView.addListener("accuse", accuse);
    this.#popupView.addListener("playAgain", playAgain);

    this.#popupView.setup();
  }
}
