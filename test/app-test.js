const { describe, it, beforeEach } = require("node:test");
const request = require("supertest");
const { createApp } = require("../src/app");
const Lobby = require("../src/models/lobby");

describe("App", () => {
  describe("GET /", (_, done) => {
    const app = createApp();

    it("Should serve the homepage", (_, done) => {
      request(app)
        .get("/")
        .expect(200)
        .expect("content-type", /text\/html/)
        .end(done);
    });
  });

  describe("GET /join", (_, done) => {
    const app = createApp();

    it("Should serve the joininig page", (_, done) => {
      request(app)
        .get("/join")
        .expect(200)
        .expect("content-type", /text\/html/)
        .end(done);
    });
  });

  describe("POST /join", (_, done) => {
    let app, lobby;

    beforeEach(() => {
      app = createApp();
      lobby = new Lobby({ maxPlayers: 3 });
      app.context = { lobby };
    });

    it("Should serve the joininig page", (_, done) => {
      request(app)
        .post("/join")
        .send({ name: "Gourab" })
        .expect(201)
        .expect("content-type", /application\/json/)
        .end(done);
    });

    it("Should give an error when lobby is full", (_, done) => {
      lobby.registerPlayer({ name: "milan" });
      lobby.registerPlayer({ name: "riya" });
      lobby.registerPlayer({ name: "sumo" });

      request(app)
        .post("/join")
        .send({ name: "Gourab" })
        .expect(406)
        .expect("content-type", /application\/json/)
        .end(done);
    });
  });
});
