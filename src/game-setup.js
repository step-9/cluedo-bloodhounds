const lodash = require("lodash");

const cardsData = require("../resources/cards.json");
const Cards = require("./models/cards");
const Game = require("./models/game");
const Players = require("./models/players");
const { createCards } = require("./utils/card-generator");

const formatLobbyDetails = lobbyDetails =>
  lobbyDetails.map(({ name, playerId }) => ({ name, id: +playerId }));

const startGame = (lobbyDetails, req) => {
  const { lobby } = req.app.context;
  const cardsLookup = createCards(cardsData);
  const cards = new Cards(cardsLookup, lodash);
  const players = new Players();
  const game = new Game({
    playersInfo: formatLobbyDetails(lobbyDetails),
    cards,
    players,
    characters: cardsData.suspect,
    shuffler: lodash
  });

  req.app.context.game = game;

  lobby.startGame(game);
};

module.exports = { startGame };
