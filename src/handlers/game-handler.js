const cardsInfo = require("../../resources/cards.json");
const redirectToHomePage = (_, res) => res.status(302).redirect("/");

const serveGamePage = (req, res) => {
  const { lobby } = req.app.context;
  if (!lobby.status().isGameStarted) return redirectToHomePage(req, res);
  res.sendFile("game-page.html", { root: "private/pages" });
};

const serveInitialGameState = (req, res) => {
  const { game } = req.app.context;
  const { playerId } = req.cookies;
  const { players, currentPlayerId } = game.playersInfo();
  const cards = game.getCardsOfPlayer(playerId);

  res.json({ players, cards, playerId: +playerId, currentPlayerId });
};

const serveGameState = (req, res) => {
  const { game, lobby } = req.app.context;
  if (!lobby.status().isGameStarted) return redirectToHomePage(req, res);

  const { playerId } = req.cookies;
  const gameState = game.state();
  const isYourTurn = +playerId === gameState.currentPlayerId;

  res.json({ isYourTurn, ...gameState });
};

const respondNotYourTurn = (_, res) =>
  res.status(401).json({ error: "not your turn" });

const handleEndTurnRequest = (req, res) => {
  const { game } = req.app.context;
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  game.changeTurn();
  res.end();
};

const handleMovePawnRequest = (req, res) => {
  const { game } = req.app.context;
  const { playerId } = req.cookies;
  const tileCoordinates = req.body;
  const { isMoved } = game.movePawn(tileCoordinates, +playerId);

  if (isMoved) return res.json({});
  res.sendStatus(400);
};

const serveCardsInfo = (_, res) => {
  const { suspect, weapon, room } = cardsInfo;
  const cardsLookup = {};
  cardsLookup.suspect = suspect.map(({ title }) => title);
  cardsLookup.weapon = weapon.map(({ title }) => title);
  cardsLookup.room = room.map(({ title }) => title);

  res.json(cardsLookup);
};

const handleStartAccusationRequest = (req, res) => {
  const { game } = req.app.context;
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  game.toggleIsAccusing();
  res.end();
};

const handleAccusation = (req, res) => {
  const { game } = req.app.context;
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  const combinationCards = req.body;
  const result = game.validateAccuse(+playerId, combinationCards);

  res.json(result);
};

module.exports = {
  serveGamePage,
  serveInitialGameState,
  serveGameState,
  handleEndTurnRequest,
  handleMovePawnRequest,
  serveCardsInfo,
  handleStartAccusationRequest,
  handleAccusation
};
