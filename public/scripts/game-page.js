const main = () => {
  const cardsContainer = document.querySelector("#cards");
  const playersContainer = document.querySelector("#players");
  const bottomPane = document.querySelector("#bottom-pane");
  const middlePane = document.querySelector("#middle-pane");
  const clueSheetBtn = document.querySelector("#clue-chart-btn");
  const clueChartContainer = document.querySelector(".clue-chart-container");

  const clueChartData = getClueChartData();
  const clueChart = new ClueChart({ clueChartContainer, clueChartData });
  clueChart.render();

  const gameService = new GameService();
  const popupView = new PopupView({ middlePane, generateElement });
  const view = new View({
    playersContainer,
    cardsContainer,
    bottomPane,
    popupView,
    clueSheetBtn,
    generateElement,
    clueChartContainer
  });

  const eventEmitter = new EventEmitter();
  const gameController = new GameController(gameService, view, eventEmitter);

  gameController.start();
};

window.onload = main;
