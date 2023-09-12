const request = require("supertest");
const { describe, it, beforeEach } = require("node:test");
const { createApp } = require("../../src/app");
const Lobby = require("../../src/models/lobby");

describe("GET /join", () => {
  const app = createApp();

  it("Should serve the joininig page", (_, done) => {
    request(app)
      .get("/join")
      .expect(200)
      .expect("content-type", /text\/html/)
      .end(done);
  });
});

describe("POST /join", () => {
  let app, lobby;

  beforeEach(() => {
    app = createApp();
    lobby = new Lobby({ maxPlayers: 3 });
    app.context = { lobby };
  });

  it("Should serve the joininig page", (_, done) => {
    request(app)
      .post("/lobby/join")
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
      .post("/lobby/join")
      .send({ name: "Gourab" })
      .expect(406)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("GET /lobby", () => {
  it("should serve the lobby page", (_, done) => {
    const app = createApp();

    request(app)
      .get("/lobby")
      .expect(200)
      .expect("content-type", /text\/html/)
      .end(done);
  });
});

describe("GET /lobby/details", () => {
  it("should give a list of players with player name and id", (_, done) => {
    const app = createApp();
    const lobby = new Lobby({ maxPlayers: 3 });
    app.context = { lobby };

    lobby.registerPlayer({ name: "milan" });

    request(app)
      .get("/lobby/details")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({ isFull: false, lobbyDetails: [{ playerId: 1, name: "milan" }] })
      .end(done);
  });
});
