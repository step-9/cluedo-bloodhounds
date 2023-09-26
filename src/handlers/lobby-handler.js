const { startGame } = require("../game-setup");
const Lobby = require("../models/lobby");

const sendRoomFullError = (_, res) =>
  res.status(406).send({ error: "Room is Full" });

const handleJoinRequest = (req, res) => {
  const { lobbies } = req.app.context;
  const { name, lobbyId } = req.body;
  const lobby = lobbies.find(lobbyId);
  if (lobby) {
    const { isFull, playerId } = lobby.registerPlayer({ name });

    if (isFull) return sendRoomFullError(req, res);

    res.status(201);
    res.cookie("name", name);
    res.cookie("playerId", playerId);
    res.cookie("gameId", lobbyId);
    res.json({ playerId, isFull, redirectUri: `/lobby/${lobbyId}` });
  }
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

const handleHostRequest = (req, res) => {
  const { lobbies } = req.app.context;
  const { name, noOfPlayers } = req.body;

  const lobby = new Lobby({ maxPlayers: noOfPlayers });
  const { playerId } = lobby.registerPlayer({ name });
  const lobbyId = lobbies.add(lobby);

  res.status(201);
  res.cookie("name", name);
  res.cookie("playerId", playerId);
  res.cookie("gameId", lobbyId);
  res.json({ playerId, lobbyId, redirectUri: `/lobby/${lobbyId}` });
};

const serveSpecificLobbyPage = (req, res) => {
  res.sendFile("lobby-template.html", { root: "private/pages" });
};

const serveSpecificLobbyDetails = (req, res) => {
  const { lobbies } = req.app.context;
  const { lobbyId } = req.params;

  const lobby = lobbies.find(lobbyId);
  const { players, isGameStarted, isFull, noOfPlayers } = lobby.status();

  if (isFull && !isGameStarted) {
    startGame(players, req);
  }

  res.json({ isFull, players, noOfPlayers, lobbyId });
};

module.exports = {
  handleJoinRequest,
  serveLobbyPage,
  serveLobbyDetails,
  handleHostRequest,
  serveSpecificLobbyPage,
  serveSpecificLobbyDetails
};
