const express = require("express");
const {
  serveGamePage,
  serveInitialGameState,
  serveGameState,
  handleEndTurnRequest,
  handleMovePawnRequest,
  serveCardsInfo
} = require("../handlers/game-handler");

const createGameRouter = () => {
  const gameRouter = express.Router();

  gameRouter.get("/", serveGamePage);
  gameRouter.get("/initial-state", serveInitialGameState);
  gameRouter.get("/state", serveGameState);
  gameRouter.post("/end-turn", handleEndTurnRequest);
  gameRouter.patch("/move-pawn", handleMovePawnRequest);
  gameRouter.get("/cards", serveCardsInfo);

  return gameRouter;
};

module.exports = createGameRouter;
