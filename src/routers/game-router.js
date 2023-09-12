const express = require("express");
const {
  serveGamePage,
  serveInitialGameState
} = require("../handlers/game-handler");

const createGameRouter = () => {
  const gameRouter = express.Router();

  gameRouter.get("/", serveGamePage);
  gameRouter.get("/initial-state", serveInitialGameState);

  return gameRouter;
};

module.exports = createGameRouter;
