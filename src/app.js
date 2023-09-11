const express = require("express");
const { requestLogger } = require("./middlewares/logger");
const {
  serveHomePage,
  serveGameJoiningPage
} = require("./handlers/resource-handler");
const {
  handleJoinRequest,
  serveLobbyPage,
  serveLobbyDetails
} = require("./handlers/lobby-handler");
const { serveGamePage } = require("./handlers/game-handler");

const createApp = () => {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.static("public"));

  app.get("/", serveHomePage);
  app.get("/join", serveGameJoiningPage);
  app.post("/join", handleJoinRequest);
  app.get("/lobby", serveLobbyPage);
  app.get("/lobby-details", serveLobbyDetails);
  app.get("/game", serveGamePage);

  return app;
};

module.exports = { createApp };
