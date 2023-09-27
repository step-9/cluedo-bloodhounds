const express = require("express");
const _ = require("lodash");

const Board = require("../models/board");
const Game = require("../models/game");
const Player = require("../models/player");
const Players = require("../models/players");

const validTiles = require("../../resources/valid-tiles.json");
const rooms = require("../../resources/rooms.json");
const staircase = require("../../resources/staircase.json");

const gameState = require("../../test/test-data/game-state-1.json");

const createPlayers = playersInfo => {
  const playerInstances = playersInfo.map(playerInfo => new Player(playerInfo));
  return new Players(playerInstances);
};

const handleGameStateRequest = (req, res) => {
  const body = req.body;
  const { gameId } = req.params;
  const { initialPositions, playersInfo } = _.isEmpty(body) ? gameState : body;

  const players = createPlayers(playersInfo);
  const board = new Board({ validTiles, rooms, staircase, initialPositions });

  const newState = { ...gameState, players, board };
  delete newState.playersInfo;
  delete newState.boardDetails;

  const game = Game.load(newState);

  req.app.context.games[gameId] = game;
  res.end();
};

const createTestRouter = () => {
  const testRouter = express.Router();
  testRouter.patch("/:gameId/game-state", handleGameStateRequest);
  return testRouter;
};

module.exports = { createTestRouter };
