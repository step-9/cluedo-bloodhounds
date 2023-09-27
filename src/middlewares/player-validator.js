const redirectToHomePage = (_, res) => {
  res.redirect(303, "/");
};

const validatePlayer = (req, res, next) => {
  const { games } = req.app.context;
  const { gameId } = req.params;

  const game = games[gameId];
  const { playerId } = req.cookies;

  if (!game || !game.hasPlayer(+playerId)) return redirectToHomePage(req, res);

  next();
};

module.exports = { validatePlayer };
