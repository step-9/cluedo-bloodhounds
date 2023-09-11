const serveHomePage = (req, res) => {
  res.sendFile("index.html", { root: "private" });
};

const serveGameJoiningPage = (req, res) => {
  res.sendFile("/joining-page.html", { root: "private" });
};

module.exports = { serveHomePage, serveGameJoiningPage };
