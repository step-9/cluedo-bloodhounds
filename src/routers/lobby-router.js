const express = require("express");
const {
  handleJoinRequest,
  serveLobbyPage,
  serveLobbyDetails
} = require("../handlers/lobby-handler");

const createLobbyRouter = () => {
  const lobbyRouter = express.Router();

  lobbyRouter.get("/", serveLobbyPage);
  lobbyRouter.post("/join", handleJoinRequest);
  lobbyRouter.get("/details", serveLobbyDetails);

  return lobbyRouter;
};

module.exports = createLobbyRouter;
