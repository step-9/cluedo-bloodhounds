const express = require("express");
const {
  handleJoinRequest,
  serveLobbyPage,
  serveLobbyDetails,
  handleHostRequest,
  serveSpecificLobbyPage,
  serveSpecificLobbyDetails
} = require("../handlers/lobby-handler");

const createLobbyRouter = () => {
  const lobbyRouter = express.Router();

  lobbyRouter.get("/", serveLobbyPage);
  lobbyRouter.post("/join", handleJoinRequest);
  lobbyRouter.get("/details", serveLobbyDetails);

  lobbyRouter.post("/host", handleHostRequest);
  lobbyRouter.get("/:lobbyId", serveSpecificLobbyPage);
  lobbyRouter.get("/:lobbyId/details", serveSpecificLobbyDetails);
  return lobbyRouter;
};

module.exports = createLobbyRouter;
