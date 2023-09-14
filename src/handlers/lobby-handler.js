const { startGame } = require("../game-setup");

const sendRoomFullError = (_, res) =>
  res.status(406).send({ error: "Room is Full" });

const handleJoinRequest = (req, res) => {
  const { lobby } = req.app.context;
  const { name } = req.body;

  const { isFull, playerId } = lobby.registerPlayer({ name });

  if (isFull) return sendRoomFullError(req, res);

  res.status(201);
  res.cookie("name", name);
  res.cookie("playerId", playerId);
  res.json({ playerId, isFull, redirectUri: "/lobby" });
};

const serveLobbyPage = (req, res) => {
  res.sendFile("lobby.html", { root: "private/pages" });
};

const serveLobbyDetails = (req, res) => {
  const { lobby } = req.app.context;
  const lobbyDetails = lobby.getAllPlayers();
  const isFull = lobby.isFull();

  if (isFull && !lobby.status().isGameStarted) {
    startGame(lobbyDetails, req);
  }

  res.json({ isFull, lobbyDetails });
};

module.exports = { handleJoinRequest, serveLobbyPage, serveLobbyDetails };
