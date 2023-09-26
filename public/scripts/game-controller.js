class GameController {
  #view;
  #playerId;
  #clueChart;
  #gameService;
  #eventEmitter;
  #playersNames;
  #playerCharacters;
  #lastGameState;
  #pollingInterval;

  constructor(gameService, view, eventEmitter, clueChart) {
    this.#view = view;
    this.#lastGameState = {};
    this.#clueChart = clueChart;
    this.#gameService = gameService;
    this.#eventEmitter = eventEmitter;
  }

  #isNewState(gameState) {
    return !areEqual(this.#lastGameState, gameState);
  }

  #endTurn() {
    this.#gameService.endTurn();
    this.#view.removeAllButtons();
  }

  #stopPolling() {
    clearInterval(this.#pollingInterval);
  }

  #fetchAndRenderCurrentState() {
    this.#gameService.getGameState(gameState => {
      const { action, currentPlayerId, isGameOver } = gameState;
      const isYourTurn = this.#playerId === currentPlayerId;
      if (!this.#isNewState(gameState)) return;
      if (!action) return;
      if (isGameOver) return this.#displayGameOver(gameState);
      if (isYourTurn) this.#enableTurn({ isYourTurn });
      this.#eventEmitter.emit(action, currentPlayerId);
      this.#lastGameState = gameState;
    });
  }

  #sendMovePawnReq(rawTileId) {
    const [x, y] = rawTileId.split(",").map(num => parseInt(num));
    return this.#gameService.sendMovePawnReq({ x, y });
  }

  #storeInitialState({ players, playerId }) {
    this.#playerId = playerId;
    this.#playersNames = players.reduce((playerNames, { id, name }) => {
      return { ...playerNames, [id]: name };
    }, {});

    this.#playerCharacters = players.reduce(
      (playerCharacters, { id, character }) => {
        return { ...playerCharacters, [id]: character };
      },
      {}
    );
  }

  #updateBoard(currentPlayerId) {
    this.#view.hideAllMessages();

    this.#gameService
      .getUpdatedPositions()
      .then(positions =>
        this.#view.updateCharacterPositions(
          positions,
          this.#playerCharacters[currentPlayerId]
        )
      );
  }

  #enableTurn({ isYourTurn, canRollDice, canMovePawn, canAccuse }) {
    if (isYourTurn) {
      if (canMovePawn) this.#view.enableMove();
      this.#view.enableAllButtons(true, canRollDice, canAccuse);
    }
  }

  #highlightPassage(room, canSuspect, canMovePawn) {
    if (canSuspect || !canMovePawn || !room.passage) return;

    const positions = {};
    const { x, y } = room.passage.coordinate;
    positions[`${x},${y}`] = { x, y };

    this.#view.highlightPositions(positions);
  }

  #changeTurn({ currentPlayerId, canRollDice, canMovePawn, canAccuse }) {
    const isYourTurn = this.#playerId === currentPlayerId;
    this.#enableTurn({ isYourTurn, canRollDice, canMovePawn, canAccuse });
    this.#updateBoard(currentPlayerId);
    this.#view.hideAllMessages();
    this.#view.highlightCurrentPlayer(currentPlayerId);

    if (isYourTurn) {
      this.#gameService
        .getInitialData()
        .then(({ room, canSuspect, canMovePawn }) => {
          this.#gameService.getCardsInfo().then(cardsInfo => {
            this.#view.renderSuspicionPrompt({
              room: room.name,
              canSuspect,
              cardsInfo
            });
          });
          this.#highlightPassage(room, canSuspect, canMovePawn);
        });
    }
  }

  #markAccusingPlayer(currentPlayerId) {
    const isYourTurn = this.#playerId === currentPlayerId;
    if (isYourTurn) return this.#view.renderAccuseButton(isYourTurn, true);

    this.#view.renderAccusationMessage(currentPlayerId);
  }

  #markSuspectingPlayer(currentPlayerId) {
    const isYourTurn = this.#playerId === currentPlayerId;
    if (isYourTurn) return;
    this.#view.renderSuspicionMessage(currentPlayerId);
  }

  #disableClueSheet() {
    this.#clueChart.disable();
  }

  #showAccusationResult(currentPlayerId) {
    this.#gameService
      .getAccusationResult()
      .then(({ accusationCombination }) => {
        this.#updateBoard(currentPlayerId);
        this.#view.hideAllMessages();
        this.#view.disableStrandedPlayers([currentPlayerId]);
        const isYourTurn = this.#playerId === currentPlayerId;
        if (isYourTurn) return this.#disableClueSheet();
        this.#view.notifyPlayerStranded(
          this.#playersNames[currentPlayerId],
          accusationCombination
        );
      });
  }

  #showSuspicion(currentPlayerId) {
    this.#gameService
      .getSuspicionCombination()
      .then(
        ({
          suspicionCombination,
          matchingCards,
          invalidatedBy,
          characterPositions
        }) => {
          this.#view.updateCharacterPositions(
            characterPositions,
            this.#playerCharacters[currentPlayerId]
          );
          this.#view.hideAllMessages();
          const isYourTurn = this.#playerId === currentPlayerId;
          const suspectorName = isYourTurn
            ? "You"
            : this.#playersNames[currentPlayerId];

          const canInvalidate = this.#playerId === invalidatedBy;
          const canAnyoneInvalidate = invalidatedBy;

          this.#view.renderSuspicionCombination({
            suspectorName,
            suspicionCombination,
            canInvalidate,
            matchingCards,
            canAnyoneInvalidate
          });
        }
      );
  }

  #renderSuspicionDialog(currentPlayerId) {
    if (this.#playerId !== currentPlayerId) return;

    if (this.#view.isSuspicionDialogPresent()) return;

    this.#gameService.getLastSuspicionPosition().then(({ room }) => {
      this.#gameService.getCardsInfo().then(cardsInfo => {
        this.#view.renderSuspicionDialog({
          room,
          canSuspect: true,
          cardsInfo
        });
      });
    });
  }

  #displayGameOver({ currentPlayerId }) {
    this.#clueChart.clear();
    this.#showAccusationResult(currentPlayerId);
    this.#view.hideAllMessages();

    const isYourTurn = this.#playerId === currentPlayerId;
    this.#stopPolling();
    this.#gameService
      .getGameOverInfo()
      .then(({ isGameWon, killingCombination }) => {
        const gameInfo = {
          isYourTurn,
          isGameWon,
          currentPlayerId,
          killingCombination,
          playerNames: this.#playersNames
        };
        this.#view.displayGameOver(gameInfo);
      });
  }

  #renderInitialGameState(initialState) {
    const { currentPlayerId, playerId, canRollDice, canMovePawn } =
      initialState;

    const isYourTurn = playerId === currentPlayerId;

    this.#changeTurn({ currentPlayerId, canRollDice, canMovePawn });

    this.#view.setupCurrentPlayerActions({
      isYourTurn,
      ...initialState
    });

    this.#view.renderDice(initialState.diceRollCombination);
    this.#view.updateCharacterPositions(
      initialState.characterPositions,
      this.#playerCharacters[currentPlayerId]
    );

    this.#view.disableStrandedPlayers(
      initialState.strandedPlayerIds,
      this.#playerId
    );
  }

  #showLastDiceRollCombination() {
    this.#view.hideAllMessages();

    this.#gameService
      .getLastDiceRollCombination()
      .then(({ diceRollCombination, possiblePositions }) => {
        if (possiblePositions) this.#view.highlightPositions(possiblePositions);
        this.#view.renderDice(diceRollCombination);
      });
  }

  #showAccusationCancelMsg(currentPlayerId) {
    this.#view.hideAllMessages();
    this.#view.closeNotificationDialog();

    const isYourTurn = this.#playerId === currentPlayerId;
    if (isYourTurn) return;

    this.#view.showAccusationCancelMsg(currentPlayerId);
  }

  #showInvalidation(currentPlayerId) {
    this.#view.hideAllMessages();

    this.#gameService
      .getInvalidatedCard()
      .then(({ invalidatedCard, invalidatorId }) => {
        const isYourTurn = this.#playerId === currentPlayerId;
        const invalidatorName = this.#playersNames[invalidatorId];

        this.#view.renderInvalidation(
          invalidatorName,
          invalidatedCard,
          isYourTurn
        );
      });
  }

  #denySuspicion() {
    this.#gameService.sendDenySuspicionReq().then(() =>
      this.#gameService
        .getInitialData()
        .then(({ room, canSuspect, canMovePawn }) => {
          this.#highlightPassage(room, canSuspect, canMovePawn);
        })
    );
  }

  #registerEvents() {
    this.#eventEmitter.on("updateBoard", currentPlayerId =>
      this.#updateBoard(currentPlayerId)
    );

    this.#eventEmitter.on("turnEnded", currentPlayerId =>
      this.#changeTurn({ currentPlayerId, canRollDice: true, canAccuse: true })
    );

    this.#eventEmitter.on("accusing", currentPlayerId =>
      this.#markAccusingPlayer(currentPlayerId)
    );

    this.#eventEmitter.on("accused", currentPlayerId =>
      this.#showAccusationResult(currentPlayerId)
    );

    this.#eventEmitter.on("diceRolled", currentPlayerId =>
      this.#showLastDiceRollCombination(currentPlayerId)
    );

    this.#eventEmitter.on("suspecting", currentPlayerId => {
      this.#markSuspectingPlayer(currentPlayerId);
      this.#renderSuspicionDialog(currentPlayerId);
    });

    this.#eventEmitter.on("suspected", currentPlayerId =>
      this.#showSuspicion(currentPlayerId)
    );

    this.#eventEmitter.on("invalidated", currentPlayerId => {
      this.#showInvalidation(currentPlayerId);
    });

    this.#eventEmitter.on("accusation-cancelled", currentPlayerId => {
      this.#showAccusationCancelMsg(currentPlayerId);
    });
  }

  #fetchAndRenderInitialState() {
    this.#gameService.getInitialData().then(initialState => {
      this.#storeInitialState(initialState);

      this.#gameService.getBoardStructure().then(boardSvg => {
        this.#view.setupGame(initialState, boardSvg);
        this.#renderInitialGameState(initialState);
        this.#fetchAndRenderCurrentState();
        this.#view.disableStrandedPlayers(initialState.strandedPlayerIds);
      });
    });

    this.#gameService.getCardsInfo().then(cardsInfo => {
      this.#view.setupAccuseDialog(cardsInfo);
    });
  }

  #restoreButtons({ canAccuse, shouldEndTurn, canRollDice, canMovePawn }) {
    if (canMovePawn) this.#view.enableMove();

    this.#view.renderButtons({
      canAccuse,
      shouldEndTurn,
      canRollDice,
      canMovePawn
    });
  }

  start() {
    this.#registerEvents();

    this.#view.addListener("onEndTurn", () => this.#endTurn());

    this.#view.addListener("invalidateCard", invalidatedCardTitle => {
      this.#gameService.sendInvalidatedCard(invalidatedCardTitle);
    });

    this.#view.addListener("movePawn", rawTileId =>
      this.#sendMovePawnReq(rawTileId)
        .then(res => {
          if (res.ok) {
            this.#fetchAndRenderCurrentState();
            this.#view.disableMove();
            this.#view.disableTileHighlighting();
            this.#view.renderEndTurnButton();
          }
          return res.json();
        })
        .then(({ room, canSuspect }) => {
          this.#gameService.getCardsInfo().then(cardsInfo => {
            this.#view.renderSuspicionDialog({ room, canSuspect, cardsInfo });

            setTimeout(() => {
              if (room && canSuspect) this.#gameService.startSuspicion();
            }, 1000);
          });
        })
    );

    this.#view.addListener("startAccusation", () => {
      this.#gameService.startAccusation();
      this.#view.disableTileHighlighting();
    });

    this.#view.addListener("denySuspicion", () => this.#denySuspicion());

    this.#view.addListener("playAgain", () => {
      this.#gameService.sendPlayAgainRequest();
    });

    this.#view.addListener("accuse", accusationCombination => {
      this.#gameService.accuse(accusationCombination).then(accusationResult => {
        this.#view.renderAccusationResult(accusationResult);
        this.#view.disableMove();
      });
    });

    this.#view.addListener("suspect", suspicionCombination => {
      this.#gameService.suspect(suspicionCombination);
      this.#view.disableMove();
    });

    this.#view.addListener("rollDice", () => {
      this.#gameService
        .rollDice()
        .then(({ diceRollCombination, possiblePositions }) => {
          this.#view.highlightPositions(possiblePositions);
          this.#view.renderDice(diceRollCombination);
          if (Object.keys(possiblePositions).length === 0)
            this.#view.renderEndTurnButton();
        });
    });

    this.#view.addListener("cancelAccusation", () => {
      this.#gameService.cancelAccusation().then(() => {
        this.#gameService
          .getInitialData()
          .then(({ canAccuse, shouldEndTurn, canRollDice }) => {
            this.#restoreButtons({ canAccuse, shouldEndTurn, canRollDice });
          });
      });
    });

    this.#view.addListener("startSuspicion", () =>
      this.#gameService.startSuspicion()
    );

    this.#fetchAndRenderInitialState();
    this.#view.setup();

    this.#pollingInterval = setInterval(
      () => this.#fetchAndRenderCurrentState(),
      500
    );
  }
}
