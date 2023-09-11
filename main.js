const { createApp } = require("./src/app");
const Lobby = require("./src/models/lobby");

const injectDependencies = app => {
  const lobby = new Lobby({ maxPlayers: 3 });
  app.context = { lobby };
};

const main = () => {
  const app = createApp();
  injectDependencies(app);
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log("listening on port", PORT));
};

main();
