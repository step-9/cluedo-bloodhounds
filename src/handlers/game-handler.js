const serveGamePage = (req, res) => {
  res.sendFile("game-page.html", { root: "private/pages" });
};

module.exports = { serveGamePage };
