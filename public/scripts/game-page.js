const renderBoard = svg => {
  const boardContainer = document.querySelector("#board");
  boardContainer.innerHTML = svg;
};

const main = () => {
  const cardsContainer = document.querySelector("#cards");
  const playersContainer = document.querySelector("#players");
  const bottomPane = document.querySelector("#bottom-pane");

  const gameService = new GameService();
<<<<<<< HEAD
  gameService.getBoardStructure(renderBoard);
  const view = new View(playersContainer, cardsContainer, generateElement);
=======
  const view = new View({
    playersContainer,
    cardsContainer,
    bottomPane,
    generateElement
  });
>>>>>>> 6aa3dfa ([#10] Milan/Sourov - Gives an End Turn button to the current player)
  const gameController = new GameController(gameService, view);

  gameController.start();
};

window.onload = main;
