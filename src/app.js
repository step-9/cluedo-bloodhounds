const express = require("express");
const { requestLogger } = require("./middlewares/logger");
const { serveHomePage } = require("./handlers/resource-handler");

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.static("public"));
  app.use(requestLogger);

  app.get("/", serveHomePage);

  return app;
};

module.exports = { createApp };
