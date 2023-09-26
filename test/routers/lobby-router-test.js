const request = require("supertest");
const { describe, it, beforeEach } = require("node:test");
const { createApp } = require("../../src/app");
const Lobby = require("../../src/models/lobby");
const Lobbies = require("../../src/models/lobbies");

describe("POST /join", () => {
  let app, lobby, lobbies;

  beforeEach(() => {
    app = createApp();
    lobby = new Lobby({ maxPlayers: 3 });
    lobbies = new Lobbies({ 1: lobby });
    app.context = { lobby, lobbies };
  });

  it("Should serve the joining page", (_, done) => {
    request(app)
      .post("/lobby/join")
      .send({ name: "Gourab", lobbyId: 1 })
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
      .send({ name: "Gourab", lobbyId: 1 })
      .expect(406)
      .expect("content-type", /application\/json/)
      .end(done);
  });

  it("Should give an error when lobby id is wrong", (_, done) => {
    lobby.registerPlayer({ name: "milan" });
    lobby.registerPlayer({ name: "riya" });
    lobby.registerPlayer({ name: "sumo" });

    request(app)
      .post("/lobby/join")
      .send({ name: "Gourab", lobbyId: 3 })
      .expect(406)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("GET /lobby", () => {
  it("should serve the lobby page", (_, done) => {
    const app = createApp();

    request(app)
      .get("/lobby/1")
      .expect(200)
      .expect("content-type", /text\/html/)
      .end(done);
  });
});

describe("GET /lobby/:lobbyId/details", () => {
  it("should give a list of players with player name and id", (_, done) => {
    const app = createApp();
    const lobby = new Lobby({ maxPlayers: 3 });
    const lobbies = new Lobbies({ 1: lobby });
    app.context = { lobbies };

    lobby.registerPlayer({ name: "milan" });

    request(app)
      .get("/lobby/1/details")
      .expect(200)
      .expect("content-type", /application\/json/)
      .expect({
        isFull: false,
        players: [{ playerId: 1, name: "milan" }],
        noOfPlayers: 3,
        lobbyId: "1"
      })
      .end(done);
  });

  it("Should start game when lobby is full and the game is not started", (context, done) => {
    const app = createApp();

    const players = [{ name: "gourab", playerId: 1 }];
    const status = context.mock.fn(() => ({
      isGameStarted: false,
      isFull: true,
      players
    }));
    const startGame = context.mock.fn();

    const lobby = { status, startGame, players };

    const lobbies = new Lobbies({ 1: lobby });

    app.context = { games: {}, lobbies };

    request(app)
      .get("/lobby/1/details")
      .expect(200)
      .expect({
        isFull: true,
        players: [{ name: "gourab", playerId: 1 }],
        lobbyId: "1"
      })
      .end(done);
  });
});

describe("POST /lobby/host", () => {
  it("should allow a player to host a game", (_, done) => {
    const app = createApp();
    const lobbies = new Lobbies();
    app.context = { lobbies };

    request(app)
      .post("/lobby/host")
      .send({ name: "Gourab", noOfPlayers: 3 })
      .expect(201)
      .expect("content-type", /application\/json/)
      .end(done);
  });
});

describe("GET /lobby/1", () => {
  it("should serve the lobby page", (_, done) => {
    const app = createApp();

    request(app)
      .get("/lobby/1")
      .expect(200)
      .expect("content-type", /text\/html/)
      .end(done);
  });
});
