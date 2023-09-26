const express = require("express");
const {
  handleJoinRequest,
  handleHostRequest,
  serveSpecificLobbyPage,
  serveSpecificLobbyDetails
} = require("../handlers/lobby-handler");

const createLobbyRouter = () => {
  const lobbyRouter = express.Router();

  lobbyRouter.get("/:lobbyId", serveSpecificLobbyPage);
  lobbyRouter.post("/host", handleHostRequest);
  lobbyRouter.post("/join", handleJoinRequest);
  lobbyRouter.get("/:lobbyId/details", serveSpecificLobbyDetails);
  return lobbyRouter;
};

module.exports = createLobbyRouter;
