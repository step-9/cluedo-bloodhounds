const main = () => {
  const cardsContainer = document.querySelector("#cards");
  const playersContainer = document.querySelector("#players");

  const gameService = new GameService();
  const view = new View(playersContainer, cardsContainer, generateElement);
  const gameController = new GameController(gameService, view);

  gameController.start();
};


window.onload = main;
