const redirectToJoinPage = (_, res) => res.status(302).redirect("/join");

const serveGamePage = (req, res) => {
  const { lobby } = req.app.context;
  if (!lobby.status().isGameStarted) return redirectToJoinPage(req, res);
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
  if (!lobby.status().isGameStarted) return redirectToJoinPage(req, res);

  const { playerId } = req.cookies;
  const { currentPlayerId } = game.state();
  const isYourTurn = +playerId === currentPlayerId;

  res.json({ currentPlayerId, isYourTurn });
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

  res.json({});
};

module.exports = {
  serveGamePage,
  serveInitialGameState,
  serveGameState,
  handleEndTurnRequest,
  handleMovePawnRequest
};
