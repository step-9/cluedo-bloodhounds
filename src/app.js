const express = require("express");
const { requestLogger } = require("./middlewares/logger");

const createApp = () => {
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.static("public"));
  app.use(requestLogger);

  return app;
};

module.exports = { createApp };
