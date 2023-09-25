class View {
  #listeners;
  #bottomPane;
  #popupView;
  #htmlGenerator;
  #cardsContainer;
  #playersContainer;
  #clueSheetBtn;
  #clueChartContainer;

  constructor({
    popupView,
    bottomPane,
    cardsContainer,
    generateElement,
    playersContainer,
    clueSheetBtn,
    clueChartContainer
  }) {
    this.#listeners = {};
    this.#popupView = popupView;
    this.#bottomPane = bottomPane;
    this.#cardsContainer = cardsContainer;
    this.#htmlGenerator = generateElement;
    this.#playersContainer = playersContainer;
    this.#clueSheetBtn = clueSheetBtn;
    this.#clueChartContainer = clueChartContainer;
  }

  addListener(eventName, callback) {
    this.#listeners[eventName] = callback;
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

  #createMarker(x, y) {
    const marker = document.querySelector("#marker");
    const tile = document.getElementById(`${x},${y}`);
    const xCoordinate = tile.x.baseVal.value;
    const yCoordinate = tile.y.baseVal.value;
    const xOffset = 3.2;
    const yOffset = -8;
    const pawnMarker = marker.cloneNode(true);

    pawnMarker.setAttribute("x", xCoordinate + xOffset);
    pawnMarker.setAttribute("y", yCoordinate + yOffset);

    return pawnMarker;
  }

  updateCharacterPositions(characterPositions, currentPlayerCharacter) {
    const boardSvg = document.querySelector("#g13");

    Object.entries(characterPositions).forEach(([character, { x, y }]) => {
      const pawnName = `${character}-pawn`;

      const lastPawnElement = document.querySelector(`#${pawnName}`);
      lastPawnElement?.remove();

      const pawnMarker = this.#createMarker(x, y);
      pawnMarker.id = pawnName;

      if (character === currentPlayerCharacter) {
        pawnMarker.classList.add("current-player");
      }

      boardSvg.append(pawnMarker);
    });
  }

  highlightPositions(positions) {
    this.enableMove();

    const tiles = Object.keys(positions);
    tiles.forEach(tile => {
      const tileElement = document.getElementById(tile);
      tileElement.onclick = () => this.#listeners.movePawn(tileElement.id);
      tileElement.classList.add("highlight-tile");
    });
  }

  disableTileHighlighting() {
    const highlightedTiles = document.querySelectorAll(".highlight-tile");
    highlightedTiles.forEach(highlightedTile =>
      highlightedTile.classList.remove("highlight-tile")
    );
  }

  disableMove() {
    const boardContainer = document.querySelector("#board");
    boardContainer.classList.add("disable-click");
  }

  enableMove() {
    const boardContainer = document.querySelector("#board");
    boardContainer.classList.remove("disable-click");
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
    const cardTitle = `${title}-card`.toLowerCase().replaceAll(" ", "-");
    cardElement.classList.add("card", cardTitle);

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

  #isButtonPresent(buttonId) {
    return document.querySelector(`#${buttonId}`);
  }

  #setupClueSheetBtn() {
    console.log(this.#clueChartContainer, this.#clueSheetBtn);
    this.#clueSheetBtn.onclick = () => {
      this.#clueChartContainer.classList.toggle("collapse");
    };
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

  showAccusationCancelMsg(currentPlayerId) {
    const msgId = `#message-${currentPlayerId}`;
    const accusingPlayer = document.querySelector(msgId);
    accusingPlayer.classList.remove("hide");
    accusingPlayer.innerText = "I cancelled Accusation";
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

  displayGameOver(gameOverInfo) {
    this.#popupView.displayGameOver(gameOverInfo);
  }

  notifyPlayerStranded(accuserName, accusationCombination) {
    this.#popupView.notifyPlayerStranded(accuserName, accusationCombination);
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

  renderButtons(permissions) {
    const diceElement = this.#bottomPane.querySelector("#dices");
    this.#bottomPane.replaceChildren(diceElement);
    this.setupCurrentPlayerActions({ ...permissions, isYourTurn: true });
  }

  setupAccuseDialog(cardsInfo) {
    this.#popupView.setupAccuseDialog(cardsInfo);
  }

  renderAccusationResult(accusationResult) {
    this.#popupView.renderAccusationResult(accusationResult);
  }

  renderDice(diceRollCombination) {
    const [dice1Count, dice2Count] = diceRollCombination || ["?", "?"];

    const dice1Element = document.querySelector("#dice1");
    const dice2Element = document.querySelector("#dice2");

    dice1Element.innerText = dice1Count;
    dice2Element.innerText = dice2Count;
  }

  renderSuspicionPrompt(suspicionPromptDetails) {
    this.#popupView.renderSuspicionPrompt(suspicionPromptDetails);
  }

  renderSuspicionDialog(suspicionDetails) {
    this.#popupView.renderSuspicionDialog(suspicionDetails);
  }

  renderSuspicionCombination(suspicionResult) {
    this.#popupView.renderSuspicionCombination(suspicionResult);
  }

  renderInvalidation(invalidatorName, invalidatedCard) {
    this.#popupView.renderInvalidation(invalidatorName, invalidatedCard);
  }

  isSuspicionDialogPresent() {
    return document.querySelector("#suspicion-popup");
  }

  closeNotificationDialog() {
    this.#popupView.closeNotificationDialog();
  }

  setup() {
    const {
      playAgain,
      accuse,
      suspect,
      invalidateCard,
      cancelAccusation,
      startSuspicion,
      denySuspicion
    } = this.#listeners;

    this.#popupView.addListener("renderEndTurnButton", () =>
      this.renderEndTurnButton()
    );

    this.#popupView.addListener("removeRollDiceButton", () =>
      this.#removeRollDiceButton()
    );

    this.#popupView.addListener("suspect", suspect);
    this.#popupView.addListener("accuse", accuse);
    this.#popupView.addListener("playAgain", playAgain);
    this.#popupView.addListener("invalidateCard", invalidateCard);
    this.#popupView.addListener("cancelAccusation", cancelAccusation);
    this.#popupView.addListener("startSuspicion", startSuspicion);
    this.#popupView.addListener("denySuspicion", denySuspicion);

    this.#setupClueSheetBtn();

    this.#popupView.setup();
  }
}
