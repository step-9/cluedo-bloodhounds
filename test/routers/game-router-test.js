const request = require("supertest");
const { describe, it } = require("node:test");
const { createApp } = require("../../src/app");

describe("GET /game", () => {
  it("should redirect to homepage when game not started", (context, done) => {
    const app = createApp();
    const lobby = {
      status: context.mock.fn(() => ({
        isGameStarted: false
      }))
    };
    app.context = { lobby };

    request(app).get("/game").expect(302).expect("location", "/").end(done);
  });

  it("should serve the game page when the game has started", (context, done) => {
    const app = createApp();
    const lobby = {
      status: context.mock.fn(() => ({
        isGameStarted: true
      }))
    };
    app.context = { lobby };

    request(app)
      .get("/game")
      .expect(200)
      .expect("content-type", /text\/html/)
      .end(done);
  });
});

describe("GET /game/initial-state", () => {
  it("should give the initial state of the game", (context, done) => {
    const status = context.mock.fn(() => ({}));
    const getCardsOfPlayer = context.mock.fn();
    const game = { status, getCardsOfPlayer };

    const app = createApp();
    app.context = { game };

    request(app)
      .get("/game/initial-state")
      .expect(200)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});
