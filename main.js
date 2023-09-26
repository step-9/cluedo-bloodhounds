const { createApp } = require("./src/app");
const Lobby = require("./src/models/lobby");
const { cycler } = require("./src/models/dice-roller");
const { createTestRouter } = require("./src/routers/testing-router");
const Lobbies = require("./src/models/lobbies");

const getDiceCombinationGenerator = () => {
  const rolls = [
    [5, 6],
    [6, 6]
  ];

  const diceCombinationGenerator = cycler(rolls);

  return diceCombinationGenerator;
};

const injectDependencies = app => {
  const maxPlayers = +process.env.MAX_PLAYERS || 3;
  const lobby = new Lobby({ maxPlayers });
  const lobbies = new Lobbies();
  const diceCombinationGenerator = getDiceCombinationGenerator();
  app.context = { lobby, lobbies, diceCombinationGenerator };
};

const setupTestEnv = app => {
  if (process.env.TEST) {
    app.use("/test", createTestRouter());
  }
};

const main = () => {
  const app = createApp();
  setupTestEnv(app);
  injectDependencies(app);
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log("listening on port", PORT));
};

main();
