const assert = require("assert");
const { describe, it } = require("node:test");
const request = require("supertest");
const { createApp } = require("../src/app");

describe("App", () => {
  describe("GET /", (_, done) => {
    const app = createApp();

    it("Should give the homepage", (_, done) => {
      request(app)
        .get("/")
        .expect(200)
        .expect("content-type", /text\/html/)
        .end(done);
    });
  });
});
