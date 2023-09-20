class View {
  #listeners;
  #bottomPane;
  #middlePane;
  #htmlGenerator;
  #cardsContainer;
  #resultContainer;
  #playersContainer;
  #notificationContainer;

  constructor({
    middlePane,
    bottomPane,
    cardsContainer,
    resultContainer,
    generateElement,
    playersContainer,
    notificationContainer
  }) {
    this.#listeners = {};
    this.#middlePane = middlePane;
    this.#bottomPane = bottomPane;
    this.#cardsContainer = cardsContainer;
    this.#htmlGenerator = generateElement;
    this.#resultContainer = resultContainer;
    this.#playersContainer = playersContainer;
    this.#notificationContainer = notificationContainer;
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

  #createAccuseDialogFrame() {
    return this.#htmlGenerator([
      "dialog",
      { id: "accusation-popup", class: "popup" },
      [
        ["h3", { class: "popup-header" }, "Select Accusation Combination"],
        [
          "form",
          { id: "accuse-form" },
          [
            ["div", { class: "selections" }, []],
            [
              "div",
              { id: "buttons" },
              [
                [
                  "button",
                  {
                    value: "default",
                    id: "accuse-confirm-btn",
                    class: "button"
                  },
                  "Confirm"
                ]
              ]
            ]
          ]
        ]
      ]
    ]);
  }

  #createOptionElement(option) {
    return this.#htmlGenerator(["option", { value: option }, option]);
  }

  #createSelectElement(name, id, options) {
    const selectElement = this.#htmlGenerator([
      "select",
      { name, id, required: "true" },
      [["option", { value: "" }, name]]
    ]);
    const optionElements = options.map(option =>
      this.#createOptionElement(option)
    );
    selectElement.append(...optionElements);

    return selectElement;
  }

  #createAndAddSelections(selectionContainer, cardsInfo) {
    const { weapon, room, suspect } = cardsInfo;
    const selectWeaponElement = this.#createSelectElement(
      "weapons",
      "select-weapon",
      weapon
    );

    const selectRoomElement = this.#createSelectElement(
      "rooms",
      "select-room",
      room
    );

    const selectSuspectElement = this.#createSelectElement(
      "suspects",
      "select-suspect",
      suspect
    );

    selectionContainer.append(
      selectRoomElement,
      selectSuspectElement,
      selectWeaponElement
    );
  }

  #readFormData(form) {
    const room = form.querySelector("#select-room").value;
    const weapon = form.querySelector("#select-weapon").value;
    const suspect = form.querySelector("#select-suspect").value;

    return { room, weapon, suspect };
  }

  #setupAccusationForm(accusationForm, dialog) {
    accusationForm.onsubmit = event => {
      event.preventDefault();
      const accusationCombination = this.#readFormData(accusationForm);
      const { accuse } = this.#listeners;

      accuse(accusationCombination);
      dialog.close();
    };
  }

  #createAccuseDialog(cardsInfo) {
    const dialog = this.#createAccuseDialogFrame();
    const selections = dialog.querySelector(".selections");
    const accusationForm = dialog.querySelector("#accuse-form");
    this.#createAndAddSelections(selections, cardsInfo);
    this.#setupAccusationForm(accusationForm, dialog);

    dialog.oncancel = event => {
      event.preventDefault();
    };

    return dialog;
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

  displayEndButton() {
    this.renderEndTurnButton();
  }

  #createGameOverMsg(message) {
    return this.#htmlGenerator(["h3", { class: "game-over-msg" }, message]);
  }

  #createHomeBtn() {
    const btn = this.#createButton("Play Again", "home");
    btn.onclick = () => this.#listeners.playAgain();
    return btn;
  }

  #displayAllPlayersStranded(killingCombination) {
    const message = this.#createGameOverMsg("All Players stranded");
    const secretCards = this.#createCardElements(killingCombination);
    const cardsContainer = this.#createCardsContainer("killing-combination");
    cardsContainer.append(...secretCards);
    const btn = this.#createHomeBtn();
    this.#resultContainer.replaceChildren(message, cardsContainer, btn);
    this.#resultContainer.showModal();
  }

  #displayWinner(playerName, killingCombination) {
    const message = this.#createGameOverMsg(`${playerName} Won!!`);
    const btn = this.#createHomeBtn();
    const secretCards = this.#createCardElements(killingCombination);
    const cardsContainer = this.#createCardsContainer("killing-combination");
    cardsContainer.append(...secretCards);
    this.#resultContainer.replaceChildren(message, cardsContainer, btn);
    this.#resultContainer.showModal();
  }

  displayGameOver({
    isYourTurn,
    isGameWon,
    playerNames,
    currentPlayerId,
    killingCombination
  }) {
    if (isYourTurn) {
      return setTimeout(() => {
        if (!isGameWon)
          return this.#displayAllPlayersStranded(killingCombination);
        this.#displayWinner(playerNames[currentPlayerId], killingCombination);
      }, 2000);
    }

    if (!isGameWon) return this.#displayAllPlayersStranded(killingCombination);
    this.#displayWinner(playerNames[currentPlayerId], killingCombination);
  }

  notifyPlayerStranded(accuserName, accusationCombination) {
    const message = this.#createGameOverMsg(`${accuserName} Stranded!!`);

    const accusedCards = this.#createCardElements(accusationCombination);
    const cardsContainer = this.#createCardsContainer("accusation-combination");
    cardsContainer.append(...accusedCards);

    this.#notificationContainer.replaceChildren(message, cardsContainer);
    this.#notificationContainer.showModal();

    setTimeout(() => {
      this.#notificationContainer.close();
    }, 3000);
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
    const accuseDialog = this.#createAccuseDialog(cardsInfo);
    this.#middlePane.append(accuseDialog);
  }

  #createCardElement(title) {
    return this.#htmlGenerator(["div", { class: "card" }, title]);
  }

  #createMessageElement(message) {
    return this.#htmlGenerator([
      "h3",
      { id: "accusation-result-message" },
      message
    ]);
  }

  #createCardElements({ weapon, room, suspect }) {
    const roomCard = this.#createCardElement(room);
    const suspectCard = this.#createCardElement(suspect);
    const weaponCard = this.#createCardElement(weapon);

    return [roomCard, suspectCard, weaponCard];
  }

  #createCardsContainer(id) {
    return this.#htmlGenerator(["div", { id }, []]);
  }

  renderAccusationResult({ killingCombination, isWon }) {
    const winningMessage = "You Sucessfully Solved the Murder Mystery";
    const wrongAccusationMessage = "Your Accusation was Wrong";
    const message = isWon ? winningMessage : wrongAccusationMessage;

    const secretCards = this.#createCardElements(killingCombination);
    const cardsContainer = this.#createCardsContainer("killing-combination");
    cardsContainer.append(...secretCards);
    const resultMessage = this.#createMessageElement(message);
    const closeButton = this.#createButton(
      "Close",
      "accusation-result-close-btn"
    );

    closeButton.onclick = () => {
      const accuseButton = document.querySelector("#accuse-btn");
      accuseButton?.remove();
      this.#resultContainer.close();
      this.renderEndTurnButton();
    };

    this.#resultContainer.append(resultMessage, cardsContainer, closeButton);
    this.#resultContainer.showModal();
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

  #createSuspectDialogFrame() {
    return this.#htmlGenerator([
      "dialog",
      { id: "suspicion-popup", class: "popup" },
      [
        ["h3", { class: "popup-header" }, "Select Suspicion Combination"],
        [
          "form",
          { id: "suspect-form" },
          [
            ["div", { class: "selections" }, []],
            [
              "div",
              { id: "buttons" },
              [
                [
                  "button",
                  {
                    value: "default",
                    id: "suspect-confirm-btn",
                    class: "button"
                  },
                  "Confirm"
                ]
              ]
            ]
          ]
        ]
      ]
    ]);
  }

  #setupSuspicionForm(suspicionForm, dialog) {
    suspicionForm.onsubmit = event => {
      event.preventDefault();
      const suspicionCombination = this.#readFormData(suspicionForm);
      this.#listeners.suspect(suspicionCombination);
      dialog.close();
    };
  }

  #createSuspicionDialog(room, cardsInfo) {
    const dialog = this.#createSuspectDialogFrame();
    const selections = dialog.querySelector(".selections");
    const suspicionForm = dialog.querySelector("#suspect-form");
    const weapon = cardsInfo.weapon;
    const suspect = cardsInfo.suspect;
    this.#createAndAddSelections(selections, { weapon, suspect, room: [room] });
    this.#setupSuspicionForm(suspicionForm, dialog);

    dialog.oncancel = event => {
      event.preventDefault();
    };
    return dialog;
  }

  renderSuspicionDialog({ room, canSuspect, cardsInfo }) {
    if (room && canSuspect) {
      const suspicionDialog = this.#createSuspicionDialog(room, cardsInfo);
      const roomSelector = suspicionDialog.querySelector("#select-room");
      roomSelector.value = room;
      roomSelector.setAttribute("disabled", true);
      this.#middlePane.append(suspicionDialog);
      suspicionDialog.showModal();
    }
  }

  renderSuspicionCombination(
    suspectorName,
    suspicionCombination,
    invalidatorName,
    invalidatedCard
  ) {
    const message = this.#createGameOverMsg(`${suspectorName} Suspected`);
    const invalidationMessage = document.createElement("h3");
    invalidationMessage.innerText = `${invalidatorName} has invalidated ${
      invalidatedCard?.title || ""
    }`;
    invalidationMessage.classList.add("invalidation-msg");

    const suspectedCards = this.#createCardElements(suspicionCombination);
    const cardsContainer = this.#createCardsContainer("suspicion-combination");
    cardsContainer.append(...suspectedCards);

    this.#notificationContainer.replaceChildren(
      message,
      cardsContainer,
      invalidationMessage
    );
    this.#notificationContainer.showModal();

    setTimeout(() => {
      this.#notificationContainer.close();
    }, 8000);
  }

  isSuspicionDialogPresent() {
    return document.querySelector("#suspicion-popup");
  }
}
