const lodash = require("lodash");
const Game = require("../models/game");
const { createCards } = require("../utils/card-generator");
const Cards = require("../models/cards");
const Players = require("../models/players");

const sendRoomFullError = (_, res) =>
  res.status(406).send({ error: "Room is Full" });

const handleJoinRequest = (req, res) => {
  const { lobby } = req.app.context;
  const { name } = req.body;

  const { isFull, playerId } = lobby.registerPlayer({ name });

  if (isFull) return sendRoomFullError(req, res);

  res.status(201);
  res.cookie("name", name);
  res.cookie("playerId", playerId);
  res.json({ playerId, isFull, redirectUri: "/lobby" });
};

const serveLobbyPage = (req, res) => {
  res.sendFile("lobby.html", { root: "private/pages" });
};

const formatLobbyDetails = lobbyDetails =>
  lobbyDetails.map(({ name, playerId }) => ({ name, id: +playerId }));

const startGame = (lobbyDetails, req) => {
  const cardsData = require("../../resources/cards.json");
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

const serveLobbyDetails = (req, res) => {
  const { lobby } = req.app.context;
  const lobbyDetails = lobby.getAllPlayers();
  const isFull = lobby.isFull();

  if (isFull && !lobby.status().isGameStarted) {
    startGame(lobbyDetails, req);
  }

  res.json({ isFull, lobbyDetails });
};

module.exports = { handleJoinRequest, serveLobbyPage, serveLobbyDetails };
