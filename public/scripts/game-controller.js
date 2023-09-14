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

  #sendMovePawnReq(rawTileId) {
    const tileId = rawTileId.split(",").map(x => parseInt(x));

    this.#gameService.sendMovePawnReq(tileId);
  }

  start() {
    this.#view.addListener("onEndTurn", () => this.#endTurn());
    this.#view.addListener("movePawn", rawTileId =>
      this.#sendMovePawnReq(rawTileId)
    );

    this.#gameService.getInitialData().then(initialState => {
      this.#gameService.getBoardStructure().then(boardSvg => {
        this.#view.setupGame(initialState, boardSvg);
      });
    });

    setInterval(() => this.#fetchAndRenderCurrentState(), 1000);
  }
}
