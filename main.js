const { createApp } = require("./src/app");
const { createTestRouter } = require("./src/routers/testing-router");
const Lobbies = require("./src/models/lobbies");

const {
  getDiceCombinationGenerator,
  randomNumberGenerator
} = require("./src/dice-combination-generator.js");

const injectDependencies = app => {
  const lobbies = new Lobbies();
  const diceCombinationGenerator = randomNumberGenerator;
  app.context = { games: {}, lobbies, diceCombinationGenerator };
};

const setupTestEnv = app => {
  if (process.env.TEST) {
    app.use("/test", createTestRouter());
    app.context.diceCombinationGenerator = getDiceCombinationGenerator();
  }
};

const main = () => {
  const app = createApp();
  injectDependencies(app);
  setupTestEnv(app);
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log("listening on port", PORT));
};

main();
