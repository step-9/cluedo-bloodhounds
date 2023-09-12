const serveGamePage = (req, res) => {
  res.sendFile("game-page.html", { root: "private/pages" });
};

const serveInitialGameState = (req, res) => {
  const { game } = req.app.context;
  const { playerId } = req.cookies;
  const { players } = game.status();
  const cards = game.getCardsOfPlayer(playerId);

  res.json({ players, cards, playerId: +playerId });
};

module.exports = { serveGamePage, serveInitialGameState };
