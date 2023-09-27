const cardsInfo = require("../../resources/cards.json");
const { rollDice } = require("../models/dice-roller");
const redirectToHomePage = (_, res) => res.redirect(303, "/");

const serveGamePage = (_, res) => {
  res.sendFile("game-page.html", { root: "private/pages" });
};

const removeCardsFrom = players =>
  players.forEach(player => delete player.cards);

const serveInitialGameState = (req, res) => {
  const { lobbies, games } = req.app.context;
  const { gameId } = req.params;

  const lobby = lobbies.find(+gameId);
  const game = games[gameId];
  const { playerId } = req.cookies;

  if (!lobby.status().isGameStarted) return redirectToHomePage(req, res);

  const playersInfo = game.playersInfo();
  const { players } = playersInfo;
  removeCardsFrom(players);
  const cards = game.getCardsOfPlayer(playerId);

  res.json({ ...playersInfo, cards, playerId: +playerId, players });
};

const serveGameState = (req, res) => {
  const { lobbies, games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;

  const gameState = game.state();
  const isYourTurn = +playerId === gameState.currentPlayerId;

  if (gameState.isGameOver) lobbies.destroy(gameId);

  res.json({ isYourTurn, ...gameState });
};

const respondNotYourTurn = (_, res) =>
  res.status(401).json({ error: "not your turn" });

const handleEndTurnRequest = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  game.changeTurn();
  res.end();
};

const handleMovePawnRequest = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const tileCoordinates = req.body;
  const { isMoved, canSuspect, room } = game.movePawn(
    tileCoordinates,
    +playerId
  );

  if (isMoved) return res.json({ room, canSuspect });
  res.sendStatus(400);
};

const serveCardsInfo = (_, res) => {
  res.json(cardsInfo);
};

const handleStartAccusationRequest = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  game.toggleIsAccusing();
  res.end();
};

const handleStartSuspicionRequest = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  game.toggleIsSuspecting();
  res.end();
};

const handleAccusation = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  const combinationCards = req.body;
  const result = game.validateAccuse(combinationCards);

  res.json(result);
};

const sendCharacterPositions = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const characterPositions = game.getCharacterPositions();
  res.json(characterPositions);
};

const sendAccusationResult = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const accusationCombination = game.getLastAccusationCombination();
  res.json({ accusationCombination });
};

const sendGameOverInfo = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const gameOverInfo = game.getGameOverInfo();
  res.json(gameOverInfo);
};

const handleRollDice = (req, res) => {
  const { playerId } = req.cookies;
  const { games } = req.app.context;
  const { gameId } = req.params;
  const game = games[gameId];

  const { diceCombinationGenerator } = req.app.context;
  const { currentPlayerId } = game.state();

  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  const diceRollCombination = rollDice(diceCombinationGenerator);

  const stepCount = diceRollCombination.reduce((sum, a) => sum + a, 0);
  const possiblePositions = game.findPossiblePositions(stepCount);

  game.updateDiceCombination(diceRollCombination);
  game.updatePossiblePositions(possiblePositions);

  res.json({ diceRollCombination, possiblePositions });
};

const sendDiceCombination = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  const diceRollCombination = game.getLastDiceCombination();
  if (+playerId !== currentPlayerId) return res.json({ diceRollCombination });

  const possiblePositions = game.getPossiblePositions();

  res.json({ diceRollCombination, possiblePositions });
};

const handleSuspicion = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  const combinationCards = req.body;
  const { suspect, room } = combinationCards;
  game.move(suspect, room);
  game.validateSuspicion(+playerId, combinationCards);

  res.json({});
};

const sendLastSuspicionCombination = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const result = {};
  result.suspicionCombination = game.getLastSuspicionCombination();
  result.characterPositions = game.getCharacterPositions();

  const { invalidatedBy, matchingCards } = game.ruleOutSuspicion();
  result.invalidatedBy = invalidatedBy;

  if (invalidatedBy === +playerId) result.matchingCards = matchingCards;

  res.json(result);
};

const sendLastSuspicionPosition = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;
  const room = game.getLastSuspicionPosition(+playerId);
  res.json({ room });
};

const handleInvalidation = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { title } = req.body;
  const { playerId } = req.cookies;

  game.invalidateSuspicion(playerId, title);

  res.end();
};

const handleDenySuspicionRequest = (req, res) => {
  const { playerId } = req.cookies;
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { currentPlayerId } = game.state();

  if (+playerId !== currentPlayerId) return respondNotYourTurn(req, res);

  game.resetPermissions();
  res.end();
};

const sendInvalidatedCard = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;

  const { currentPlayerId } = game.state();
  const { invalidatorId, invalidatedCard } = game.getLastSuspicion();

  if (currentPlayerId !== +playerId) return res.json({ invalidatorId });

  res.json({ invalidatedCard, invalidatorId });
};

const cancelAccusation = (req, res) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;

  const { currentPlayerId } = game.state();
  if (currentPlayerId !== +playerId) return respondNotYourTurn(req, res);

  game.cancelAccusation();

  res.end();
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
  handleRollDice,
  handleStartSuspicionRequest,
  handleSuspicion,
  sendLastSuspicionCombination,
  sendLastSuspicionPosition,
  handleInvalidation,
  sendInvalidatedCard,
  cancelAccusation,
  handleDenySuspicionRequest
};
