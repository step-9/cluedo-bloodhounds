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
  sendLastSuspicionPosition,
  handleInvalidation,
  sendInvalidatedCard,
  cancelAccusation,
  handleDenySuspicionRequest
} = require("../handlers/game-handler");

const createGameRouter = () => {
  const gameRouter = express.Router();

  gameRouter.get("/", serveGamePage);
  gameRouter.get("/initial-state", serveInitialGameState);
  gameRouter.get("/state", serveGameState);
  gameRouter.get("/cards", serveCardsInfo);
  gameRouter.get("/character-positions", sendCharacterPositions);

  gameRouter.post("/roll-dice", handleRollDice);
  gameRouter.patch("/move-pawn", handleMovePawnRequest);
  gameRouter.get("/dice-combination", sendDiceCombination);
  gameRouter.post("/end-turn", handleEndTurnRequest);
  gameRouter.get("/game-over-info", sendGameOverInfo);

  gameRouter.patch("/suspicion-state", handleStartSuspicionRequest);
  gameRouter.post("/suspect", handleSuspicion);
  gameRouter.get("/suspicion-combination", sendLastSuspicionCombination);
  gameRouter.get("/last-suspicion-position", sendLastSuspicionPosition);
  gameRouter.get("/suspect/invalidate", sendInvalidatedCard);
  gameRouter.post("/suspect/invalidate", handleInvalidation);
  gameRouter.patch("/deny-suspicion", handleDenySuspicionRequest);

  gameRouter.patch("/accusation-state", handleStartAccusationRequest);
  gameRouter.post("/accuse", handleAccusation);
  gameRouter.patch("/accuse", cancelAccusation);
  gameRouter.get("/accusation-result", sendAccusationResult);

  return gameRouter;
};

module.exports = createGameRouter;
