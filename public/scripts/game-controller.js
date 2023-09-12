class GameController {
  #view;
  #gameService;

  constructor(gameService, view) {
    this.#gameService = gameService;
    this.#view = view;
  }

  start() {
    this.#gameService.getInitialData(data => {
      this.#view.start(data);
    });
  }
}
