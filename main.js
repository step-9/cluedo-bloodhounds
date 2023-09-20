const { createApp } = require("./src/app");
const Lobby = require("./src/models/lobby");
const validTiles = require("./resources/valid-tiles.json");
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
    [1, 2],
    [2, 3],
    [2, 2],
    [6, 6]
  ];

  const diceCombinationGenerator = cycler(rolls);

  return diceCombinationGenerator;
};

const injectDependencies = app => {
  const board = new Board({ rooms, validTiles });
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
