const serveGamePage = (req, res) => {
  const { lobby } = req.app.context;
  if (!lobby.status().isGameStarted) return res.status(302).redirect("/join");
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
  const { game } = req.app.context;
  res.json(game.state());
};

module.exports = { serveGamePage, serveInitialGameState, serveGameState };
