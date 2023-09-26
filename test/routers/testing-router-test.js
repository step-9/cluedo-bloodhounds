const request = require("supertest");
const { describe, it } = require("node:test");
const { createApp } = require("../../src/app");
const { createTestRouter } = require("../../src/routers/testing-router");
const gameState = require("../test-data/game-state-2.json");

describe("PATCH /game-state", () => {
  it("should load a specific game state", (context, done) => {
    const app = createApp();
    app.use("/test", createTestRouter());
    app.context = {};

    request(app)
      .patch("/test/game-state")
      .send(gameState)
      .expect(200)
      .end(done);
  });

  it("should load the default game state", (context, done) => {
    const app = createApp();
    app.use("/test", createTestRouter());
    app.context = {};

    request(app).patch("/test/game-state").expect(200).end(done);
  });
});
