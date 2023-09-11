const express = require("express");
const { serveGameJoiningPage } = require("../handlers/resource-handler");
const {
  handleJoinRequest,
  serveLobbyPage,
  serveLobbyDetails
} = require("../handlers/lobby-handler");

const createLobbyRouter = () => {
  const lobbyRouter = express.Router();
  
  lobbyRouter.get("/join", serveGameJoiningPage);
  lobbyRouter.post("/join", handleJoinRequest);
  lobbyRouter.get("/lobby", serveLobbyPage);
  lobbyRouter.get("/lobby-details", serveLobbyDetails);

  return lobbyRouter;
};

module.exports = createLobbyRouter;
