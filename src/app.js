const express = require("express");
const { requestLogger } = require("./middlewares/logger");
const {
  serveHomePage,
  serveGameJoiningPage
} = require("./handlers/resource-handler");

const createApp = () => {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.static("public"));

  app.get("/", serveHomePage);
  app.get("/join", serveGameJoiningPage);

  return app;
};

module.exports = { createApp };
