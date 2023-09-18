class GameController {
  #view;
  #playerId;
  #gameService;
  #eventEmitter;
  #playersNames;
  #lastGameState;
  #pollingInterval;

  constructor(gameService, view, eventEmitter) {
    this.#view = view;
    this.#lastGameState = {};
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
      if (isYourTurn) this.#enableTurn();

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
  }

  #updateBoard() {
    this.#gameService
      .getUpdatedPositions()
      .then(positions => this.#view.updateCharacterPositions(positions));
  }

  #enableTurn(isYourTurn) {
    if (isYourTurn) {
      this.#view.enableMove();
      this.#view.enableAllButtons(true);
    }
  }

  #changeTurn(currentPlayerId) {
    const isYourTurn = this.#playerId === currentPlayerId;
    this.#enableTurn(isYourTurn);
    this.#view.highlightCurrentPlayer(currentPlayerId);
  }

  #markAccusingPlayer(currentPlayerId) {
    const isYourTurn = this.#playerId === currentPlayerId;
    if (isYourTurn) return this.#view.renderAccuseButton(isYourTurn, true);

    this.#view.renderAccusationMessage(currentPlayerId);
  }

  #showAccusationResult(currentPlayerId) {
    this.#gameService
      .getAccusationResult()
      .then(({ accusationCombination }) => {
        this.#view.hideAllMessages();
        this.#view.disableStrandedPlayers([currentPlayerId]);
        const isYourTurn = this.#playerId === currentPlayerId;
        if (isYourTurn) return;
        this.#view.notifyPlayerStranded(
          this.#playersNames[currentPlayerId],
          accusationCombination
        );
      });
  }

  #displayGameOver({ currentPlayerId }) {
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
    const {
      canAccuse,
      shouldEndTurn,
      currentPlayerId,
      playerId,
      strandedPlayerIds,
      characterPositions
    } = initialState;

    const isYourTurn = playerId === currentPlayerId;

    this.#changeTurn(currentPlayerId);

    this.#view.setupCurrentPlayerActions({
      isYourTurn,
      canAccuse,
      shouldEndTurn
    });

    this.#view.updateCharacterPositions(characterPositions);
    this.#view.disableStrandedPlayers(strandedPlayerIds, this.#playerId);
  }

  #registerEvents() {
    this.#eventEmitter.on("updateBoard", () => this.#updateBoard());
    this.#eventEmitter.on("turnEnded", currentPlayerId =>
      this.#changeTurn(currentPlayerId)
    );
    this.#eventEmitter.on("accusing", currentPlayerId =>
      this.#markAccusingPlayer(currentPlayerId)
    );
    this.#eventEmitter.on("accused", currentPlayerId =>
      this.#showAccusationResult(currentPlayerId)
    );
  }

  start() {
    this.#registerEvents();

    this.#view.addListener("onEndTurn", () => this.#endTurn());

    this.#view.addListener("movePawn", rawTileId =>
      this.#sendMovePawnReq(rawTileId).then(res => {
        if (res.ok) {
          this.#fetchAndRenderCurrentState();
          this.#view.disableMove();
          this.#view.renderEndTurnButton();
        }
      })
    );

    this.#view.addListener("startAccusation", () =>
      this.#gameService.startAccusation()
    );

    this.#view.addListener("playAgain", () => {
      this.#gameService.sendPlayAgainRequest();
    });

    this.#view.addListener("accuse", accusationCombination => {
      this.#gameService.accuse(accusationCombination).then(accusationResult => {
        this.#view.renderAccusationResult(accusationResult);
        this.#view.disableMove();
      });
    });

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

    this.#pollingInterval = setInterval(
      () => this.#fetchAndRenderCurrentState(),
      500
    );
  }
}
