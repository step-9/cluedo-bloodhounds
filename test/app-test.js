const { describe, it, beforeEach } = require("node:test");
const request = require("supertest");
const { createApp } = require("../src/app");
const Lobby = require("../src/models/lobby");

describe("App", () => {
  describe("GET /", () => {
    const app = createApp();

    it("Should serve the homepage", (_, done) => {
      request(app)
        .get("/")
        .expect(200)
        .expect("content-type", /text\/html/)
        .end(done);
    });
  });
});
