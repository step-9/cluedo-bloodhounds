const cardsInfo = require("../../resources/cards.json");
const { rollDice } = require("../models/dice-roller");
const redirectToHomePage = (_, res) => res.status(302).redirect("/");

const serveGamePage = (req, res) => {
  const { lobby } = req.app.context;
  if (!lobby.status().isGameStarted) return redirectToHomePage(req, res);
  res.sendFile("game-page.html", { root: "private/pages" });
};

const removeCardsFrom = players =>
  players.forEach(player => delete player.cards);

const serveInitialGameState = (req, res) => {
  const { game } = req.app.context;
  const { playerId } = req.cookies;
  const playersInfo = game.playersInfo();
  const { players } = playersInfo;
  removeCardsFrom(players);
  const cards = game.getCardsOfPlayer(playerId);

  res.json({ ...playersInfo, cards, playerId: +playerId, players });
};

const serveGameState = (req, res) => {
  const { game, lobby } = req.app.context;
  const { playerId } = req.cookies;
  const gameState = game.state();
  const isYourTurn = +playerId === gameState.currentPlayerId;

  if (gameState.isGameOver) lobby.clear();

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
  res.json(cardsInfo);
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

const sendCharacterPositions = (req, res) => {
  const { game } = req.app.context;
  const characterPositions = game.getCharacterPositions();
  res.json(characterPositions);
};

const sendAccusationResult = (req, res) => {
  const { game } = req.app.context;
  const accusationCombination = game.getLastAccusationCombination();
  res.json({ accusationCombination });
};

const sendGameOverInfo = (req, res) => {
  const { game } = req.app.context;
  const gameOverInfo = game.getGameOverInfo();
  res.json(gameOverInfo);
};

const handleRollDice = (req, res) => {
  const { game, diceCombinationGenerator } = req.app.context;
  const diceRollCombination = rollDice(diceCombinationGenerator);

  const stepCount = diceRollCombination.reduce((sum, a) => sum + a, 0);
  const possiblePositions = game.findPossiblePositions(stepCount);

  game.updateDiceCombination(diceRollCombination);
  game.updatePossiblePositions(possiblePositions);

  res.json({ diceRollCombination, possiblePositions });
};

const sendDiceCombination = (req, res) => {
  const { game } = req.app.context;
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  const diceRollCombination = game.getLastDiceCombination();
  if (+playerId !== currentPlayerId) return res.json({ diceRollCombination });

  const possiblePositions = game.getPossiblePositions();

  res.json({ diceRollCombination, possiblePositions });
};

module.exports = {
  serveGamePage,
  serveInitialGameState,
  serveGameState,
  handleEndTurnRequest,
  handleMovePawnRequest,
  serveCardsInfo,
  handleStartAccusationRequest,
  handleAccusation,
  sendCharacterPositions,
  sendGameOverInfo,
  sendAccusationResult,
  sendDiceCombination,
  handleRollDice
};
