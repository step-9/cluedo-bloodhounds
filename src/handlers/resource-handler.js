const serveHomePage = (req, res) => {
  res.sendFile("index.html", { root: "private" });
};

module.exports = { serveHomePage };
