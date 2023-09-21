const main = () => {
  const cardsContainer = document.querySelector("#cards");
  const playersContainer = document.querySelector("#players");
  const bottomPane = document.querySelector("#bottom-pane");
  const middlePane = document.querySelector("#middle-pane");

  const gameService = new GameService();
  const popupView = new PopupView({ middlePane, generateElement });
  const view = new View({
    playersContainer,
    cardsContainer,
    bottomPane,
    popupView,
    generateElement
  });

  const eventEmitter = new EventEmitter();
  const gameController = new GameController(gameService, view, eventEmitter);

  gameController.start();
};

window.onload = main;
