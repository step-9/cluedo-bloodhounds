class GameController {
  #view;
  #gameService;
  #lastGameState;
  #playersNames;

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
    const [x, y] = rawTileId.split(",").map(num => parseInt(num));
    return this.#gameService.sendMovePawnReq({ x, y });
  }

  #storePlayerNames(playersData) {
    this.#playersNames = playersData.reduce((playerNames, { id, name }) => {
      return { ...playerNames, [id]: name };
    }, {});
    console.log(this.#playersNames);
  }

  start() {
    this.#view.addListener("onEndTurn", () => this.#endTurn());

    this.#view.addListener("movePawn", rawTileId =>
      this.#sendMovePawnReq(rawTileId).then(res => {
        if (res.ok) this.#view.disableMove();
      })
    );

    this.#view.addListener("startAccusation", () =>
      this.#gameService.startAccusation()
    );

    this.#view.addListener("accuse", accusationCombination => {
      this.#gameService.accuse(accusationCombination).then(accusationResult => {
        this.#view.renderAccusationResult(accusationResult);
        this.#view.disableMove();
      });
    });

    this.#gameService.getCardsInfo().then(cardsInfo => {
      this.#view.setupAccuseDialog(cardsInfo);
    });

    this.#gameService.getInitialData().then(initialState => {
      this.#storePlayerNames(initialState.players);
      this.#gameService.getBoardStructure().then(boardSvg => {
        this.#view.setupGame(initialState, boardSvg);
        this.#fetchAndRenderCurrentState();
      });
    });

    setInterval(() => this.#fetchAndRenderCurrentState(), 500);
  }
}
