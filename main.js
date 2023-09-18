const { createApp } = require("./src/app");
const Lobby = require("./src/models/lobby");
const blockedTiles = require("./resources/blocked-tiles.json");
const rooms = require("./resources/rooms.json");
const Board = require("./src/models/board");
const { cycler } = require("./src/models/dice-roller");

const getDiceCombinationGenerator = () => {
  const rolls = [
    [4, 4],
    [4, 3],
    [6, 6],
    [1, 1],
    [1, 1],
    [1, 1],
    [2, 1]
  ];

  const diceCombinationGenerator = cycler(rolls);

  return diceCombinationGenerator;
};

const injectDependencies = app => {
  const dimensions = { length: 24, breadth: 25 };
  const board = new Board({ rooms, blockedTiles, dimensions });
  const lobby = new Lobby({ maxPlayers: 3 });
  const diceCombinationGenerator = getDiceCombinationGenerator();
  app.context = { lobby, board, diceCombinationGenerator };
};

const main = () => {
  const app = createApp();
  injectDependencies(app);
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log("listening on port", PORT));
};

main();
