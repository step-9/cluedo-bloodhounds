class View {
  #playersContainer;
  #cardsContainer;
  #htmlGenerator;
  #listeners;
  #bottomPane;
  #middlePane;
  #resultContainer;

  constructor({
    playersContainer,
    cardsContainer,
    bottomPane,
    middlePane,
    resultContainer,
    generateElement
  }) {
    this.#playersContainer = playersContainer;
    this.#cardsContainer = cardsContainer;
    this.#htmlGenerator = generateElement;
    this.#bottomPane = bottomPane;
    this.#middlePane = middlePane;
    this.#resultContainer = resultContainer;
    this.#listeners = {};
  }

  addListener(eventName, callback) {
    this.#listeners[eventName] = callback;
  }

  #renderPlayerInfo({ name, id, character }) {
    const playerInfoElement = this.#htmlGenerator([
      "div",
      { class: "player-info", id: `player-${id}` },
      [
        ["div", { class: `icon ${character}`, id: `avatar-${id}` }, character],
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

  #highlightCurrentPlayer(currentPlayerId) {
    const players = document.querySelectorAll(".icon");
    players.forEach(player => player.classList.remove("highlight"));

    const currentPlayer = document.querySelector(`#avatar-${currentPlayerId}`);
    currentPlayer.classList.add("highlight");
  }

  #isButtonPresent(buttonId) {
    return document.querySelector(`#${buttonId}`);
  }

  #removeAccuseBtn() {
    const accuseBtn = document.querySelector("#accuse-btn");
    accuseBtn.remove();
  }

  #renderEndTurnButton() {
    if (this.#isButtonPresent("end-turn-btn")) return;

    const endTurnBtn = this.#createButton("End Turn", "end-turn-btn");

    endTurnBtn.onclick = () => {
      const { onEndTurn } = this.#listeners;
      onEndTurn();
      endTurnBtn.remove();
    };

    this.#bottomPane.appendChild(endTurnBtn);
  }

  #renderAccuseButton(isYourTurn, isAccusing) {
    const accuseDialog = document.querySelector("#accusation-popup");

    if (!isYourTurn) {
      this.#deleteButton("accuse-btn");
      return;
    }

    if (isYourTurn && isAccusing) {
      accuseDialog.showModal();
    }

    if (isYourTurn && this.#isButtonPresent("accuse-btn")) return;

    const accuseBtn = this.#createButton("Accuse", "accuse-btn");

    accuseBtn.onclick = () => {
      const { startAccusation } = this.#listeners;
      accuseDialog.showModal();
      startAccusation();
    };

    this.#bottomPane.appendChild(accuseBtn);
  }

  #hideAllMessages() {
    const messageElements = document.querySelectorAll(".message");
    messageElements.forEach(element => element.classList.add("hide"));
  }

  #renderAccusationMessage(isYourTurn, isAccusing, currentPlayerId) {
    const accusingPlayer = document.querySelector(
      `#message-${currentPlayerId}`
    );

    if (!isAccusing) return this.#hideAllMessages();
    if (isYourTurn) return;

    accusingPlayer.classList.remove("hide");
    accusingPlayer.innerText = "I am Accusing";
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
                  "Accuse"
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

  #readFormData() {
    const room = document.querySelector("#select-room").value;
    const weapon = document.querySelector("#select-weapon").value;
    const suspect = document.querySelector("#select-suspect").value;

    return { room, weapon, suspect };
  }

  #setupAccusationForm(accusationForm, dialog) {
    accusationForm.onsubmit = event => {
      event.preventDefault();
      const accusationCombination = this.#readFormData();
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
    return dialog;
  }

  #disableStrandedPlayers(strandedPlayerIds) {
    strandedPlayerIds.forEach(strandedPlayerId => {
      const playerIconElement = document.querySelector(
        `#avatar-${strandedPlayerId}`
      );

      playerIconElement.classList.add("stranded-player");
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

  disableMove() {
    const boardContainer = document.querySelector("#board");
    boardContainer.classList.add("disable-click");
  }

  enableMove() {
    const boardContainer = document.querySelector("#board");
    boardContainer.classList.remove("disable-click");
  }

  displayEndButton() {
    this.#renderEndTurnButton();
  }

  #createGameOverMsg(message) {
    return this.#htmlGenerator(["h3", { class: "game-over-msg" }, message]);
  }

  #createHomeBtn() {
    const btn = this.#createButton("Play Again", "home");
    btn.onclick = () => this.#listeners.playAgain();
    return btn;
  }

  #displayAllPlayersStranded() {
    const message = this.#createGameOverMsg("All Players stranded");
    const btn = this.#createHomeBtn();
    this.#resultContainer.replaceChildren(message, btn);
    this.#resultContainer.showModal();
  }

  #displayWinner(playerName) {
    const message = this.#createGameOverMsg(`${playerName} Won!!`);
    const btn = this.#createHomeBtn();
    this.#resultContainer.replaceChildren(message, btn);
    this.#resultContainer.showModal();
  }

  #displayGameOver({ isYourTurn, isGameWon, playerNames, currentPlayerId }) {
    if (isYourTurn) {
      return setTimeout(() => {
        if (!isGameWon) return this.#displayAllPlayersStranded();
        this.#displayWinner(playerNames[currentPlayerId]);
      }, 2000);
    }

    if (!isGameWon) return this.#displayAllPlayersStranded();
    this.#displayWinner(playerNames[currentPlayerId]);
  }

  #notifyPlayerStranded(
    newStrandedPlayers,
    prevStrandedPlayers = [],
    playerNames,
    isYourTurn
  ) {
    if (isYourTurn) return;
    if (newStrandedPlayers.length === prevStrandedPlayers.length) return;

    console.log(newStrandedPlayers, prevStrandedPlayers);

    const lastStrandedPlayerId = newStrandedPlayers.at(-1);
    const message = this.#createGameOverMsg(
      `${playerNames[lastStrandedPlayerId]} Stranded!!`
    );
    this.#resultContainer.replaceChildren(message);
    this.#resultContainer.showModal();

    setTimeout(() => {
      this.#resultContainer.close();
    }, 2000);
  }

  renderGameState(gameState, playerNames, lastGameState) {
    const {
      isYourTurn,
      currentPlayerId,
      isAccusing,
      characterPositions,
      shouldEndTurn,
      canAccuse,
      isGameOver,
      isGameWon,
      strandedPlayerIds
    } = gameState;

    this.#disableStrandedPlayers(strandedPlayerIds);
    this.#notifyPlayerStranded(
      strandedPlayerIds,
      lastGameState.strandedPlayerIds,
      playerNames,
      isYourTurn
    );
    this.#renderAccusationMessage(isYourTurn, isAccusing, currentPlayerId);

    if (isGameOver)
      return this.#displayGameOver({
        isGameWon,
        playerNames,
        currentPlayerId,
        isYourTurn
      });

    this.#highlightCurrentPlayer(currentPlayerId);
    this.#renderAccuseButton(isYourTurn, isAccusing, currentPlayerId);

    if (isYourTurn) {
      if (shouldEndTurn) this.#renderEndTurnButton();
      else this.enableMove();
      if (!canAccuse) this.#removeAccuseBtn();
    }

    this.#updateCharacterPositions(characterPositions);
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
    const weaponCard = this.#createCardElement(weapon);
    const roomCard = this.#createCardElement(room);
    const suspectCard = this.#createCardElement(suspect);

    return [weaponCard, roomCard, suspectCard];
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
      this.#renderEndTurnButton();
    };

    this.#resultContainer.append(resultMessage, cardsContainer, closeButton);
    this.#resultContainer.showModal();
  }

  #updateCharacterPositions(characterPositions) {
    Object.entries(characterPositions).forEach(([character, { x, y }]) => {
      const pawn = `${character}-pawn`;
      const previousPositionElement = document.querySelector(`.${pawn}`);
      previousPositionElement?.classList.remove(pawn);

      const currentPositionElement = document.getElementById(`${x},${y}`);
      currentPositionElement.classList.add(pawn);
    });
  }
}
