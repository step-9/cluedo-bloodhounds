class GameController {
  #view;
  #gameService;
  #lastGameState;

  constructor(gameService, view) {
    this.#gameService = gameService;
    this.#view = view;
    this.#lastGameState = {};
  }

  #isNewState(gameState) {
    return !areEqual(this.#lastGameState, gameState);
  }

  #endTurn() {
    this.#gameService.endTurn();
  }

  #fetchAndRenderCurrentState() {
    this.#gameService.getGameState(gameState => {
      if (!this.#isNewState(gameState)) return;

      this.#lastGameState = gameState;
      this.#view.renderGameState(gameState);
    });
  }

  start() {
    this.#view.addListener("onEndTurn", () => this.#endTurn());

    this.#gameService.getInitialData(initialState => {
      this.#view.setupGame(initialState);
    });

    setInterval(() => this.#fetchAndRenderCurrentState(), 1000);
  }
}
