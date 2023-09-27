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

const { validatePlayer } = require("../middlewares/player-validator");

const createGameRouter = () => {
  const gameRouter = express.Router();

  gameRouter.get("/:gameId", validatePlayer, serveGamePage);
  gameRouter.get("/:gameId/initial-state", serveInitialGameState);
  gameRouter.get("/:gameId/state", serveGameState);
  gameRouter.get("/:gameId/cards", serveCardsInfo);
  gameRouter.get("/:gameId/character-positions", sendCharacterPositions);

  gameRouter.post("/:gameId/roll-dice", handleRollDice);
  gameRouter.patch("/:gameId/move-pawn", handleMovePawnRequest);
  gameRouter.get("/:gameId/dice-combination", sendDiceCombination);
  gameRouter.post("/:gameId/end-turn", handleEndTurnRequest);
  gameRouter.get("/:gameId/game-over-info", sendGameOverInfo);

  gameRouter.patch("/:gameId/suspicion-state", handleStartSuspicionRequest);
  gameRouter.post("/:gameId/suspect", handleSuspicion);
  gameRouter.get(
    "/:gameId/suspicion-combination",
    sendLastSuspicionCombination
  );
  gameRouter.get("/:gameId/last-suspicion-position", sendLastSuspicionPosition);
  gameRouter.get("/:gameId/suspect/invalidate", sendInvalidatedCard);
  gameRouter.post("/:gameId/suspect/invalidate", handleInvalidation);
  gameRouter.patch("/:gameId/deny-suspicion", handleDenySuspicionRequest);

  gameRouter.patch("/:gameId/accusation-state", handleStartAccusationRequest);
  gameRouter.post("/:gameId/accuse", handleAccusation);
  gameRouter.patch("/:gameId/accuse", cancelAccusation);
  gameRouter.get("/:gameId/accusation-result", sendAccusationResult);

  return gameRouter;
};

module.exports = createGameRouter;
