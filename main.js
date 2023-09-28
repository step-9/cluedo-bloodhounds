const { createApp } = require("./src/app");
const { cycler } = require("./src/models/dice-roller");
const { createTestRouter } = require("./src/routers/testing-router");
const Lobbies = require("./src/models/lobbies");

const getDiceCombinationGenerator = () => {
  const rolls = [
    [6, 5],
    [5, 4],
    [3, 6],
    [5, 5],
    [4, 3]
  ];

  const diceCombinationGenerator = cycler(rolls);

  return diceCombinationGenerator;
};

const injectDependencies = app => {
  const lobbies = new Lobbies();
  const diceCombinationGenerator = getDiceCombinationGenerator();
  app.context = { games: {}, lobbies, diceCombinationGenerator };
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
