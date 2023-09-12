const request = require("supertest");
const { describe, it } = require("node:test");
const { createApp } = require("../../src/app");

describe("GET /game", () => {
  it("should serve the game page", (_, done) => {
    const app = createApp();

    request(app)
      .get("/game")
      .expect(200)
      .expect("content-type", /text\/html/)
      .end(done);
  });
});

describe("GET /game/initial-state", () => {
  it("should give the initial state of the game", (_, done) => {
    const app = createApp();

    request(app)
      .get("/game/initial-state")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});