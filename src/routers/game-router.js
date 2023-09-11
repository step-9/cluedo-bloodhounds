const express = require("express");
const { serveGamePage } = require("../handlers/game-handler");

const createGameRouter = () => {
  const gameRouter = express.Router();

  gameRouter.get("/game", serveGamePage);

  return gameRouter;
};

module.exports = createGameRouter;
