const express = require("express");
const {
  serveGamePage,
  serveInitialGameState,
  serveGameState
} = require("../handlers/game-handler");

const createGameRouter = () => {
  const gameRouter = express.Router();

  gameRouter.get("/", serveGamePage);
  gameRouter.get("/initial-state", serveInitialGameState);
  gameRouter.get("/state", serveGameState);

  return gameRouter;
};

module.exports = createGameRouter;
