const main = () => {
  const cardsContainer = document.querySelector("#cards");
  const playersContainer = document.querySelector("#players");
  const bottomPane = document.querySelector("#bottom-pane");
  const middlePane = document.querySelector("#middle-pane");

  const gameService = new GameService();
  const view = new View({
    playersContainer,
    cardsContainer,
    bottomPane,
    middlePane,
    generateElement
  });

  const gameController = new GameController(gameService, view);

  gameController.start();
};

window.onload = main;
