const express = require("express");
const {
  serveGamePage,
  serveInitialGameState,
  serveGameState,
  handleEndTurnRequest,
  handleMovePawnRequest,
  serveCardsInfo,
  handleStartAccusationRequest,
  handleAccusation,
  sendCharacterPositions,
  sendAccusationResult,
  sendGameOverInfo,
  sendDiceCombination,
  handleRollDice,
  handleStartSuspicionRequest,
  sendLastSuspicionCombination,
  handleSuspicion,
  sendLastSuspicionPosition
} = require("../handlers/game-handler");

const createGameRouter = () => {
  const gameRouter = express.Router();

  gameRouter.get("/", serveGamePage);
  gameRouter.get("/initial-state", serveInitialGameState);
  gameRouter.get("/state", serveGameState);
  gameRouter.post("/end-turn", handleEndTurnRequest);
  gameRouter.patch("/move-pawn", handleMovePawnRequest);
  gameRouter.get("/cards", serveCardsInfo);
  gameRouter.patch("/accusation-state", handleStartAccusationRequest);
  gameRouter.post("/accuse", handleAccusation);
  gameRouter.get("/character-positions", sendCharacterPositions);
  gameRouter.get("/accusation-result", sendAccusationResult);
  gameRouter.get("/game-over-info", sendGameOverInfo);
  gameRouter.post("/roll-dice", handleRollDice);
  gameRouter.get("/dice-combination", sendDiceCombination);
  gameRouter.patch("/suspicion-state", handleStartSuspicionRequest);
  gameRouter.get("/suspicion-combination", sendLastSuspicionCombination);
  gameRouter.post("/suspect", handleSuspicion);
  gameRouter.get("/last-suspicion-position", sendLastSuspicionPosition);

  return gameRouter;
};

module.exports = createGameRouter;
