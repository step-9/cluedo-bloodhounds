const serveGamePage = (req, res) => {
  res.sendFile("game-page.html", { root: "private/pages" });
};

const serveInitialGameState = (req, res) => {
  const initialGameState = {
    players: [
      { name: "gourab", playerId: 1, character: "Scarlet" },
      { name: "milan", playerId: 2, character: "Mustard" },
      { name: "sourov", playerId: 3, character: "Green" }
    ],
    cards: ["Mustard", "Dagger", "Rope", "Conservatory", "Lounge", "Peacock"]
  };

  res.json(initialGameState);
};

module.exports = { serveGamePage, serveInitialGameState };
