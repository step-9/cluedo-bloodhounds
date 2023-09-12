const { describe, it } = require("node:test");
const assert = require("assert");
const Lobby = require("../../src/models/lobby");

describe("Lobby", () => {
  describe("registerPlayer", () => {
    it("should register player when the lobby is not full", () => {
      const lobby = new Lobby({ maxPlayers: 3 });
      const { isFull, playerId } = lobby.registerPlayer({ name: "gourab" });

      assert.strictEqual(isFull, false);
      assert.strictEqual(playerId, 1);
    });

    it("should not register player if the lobby is full", () => {
      const lobby = new Lobby({ maxPlayers: 1 });
      lobby.registerPlayer({ name: "milan" });
      const { isFull } = lobby.registerPlayer({ name: "gourab" });

      assert.strictEqual(isFull, true);
    });

    it("should create a lobby of 6 players when max players is not provided", () => {
      const lobby = new Lobby({});
      const names = ["milan", "raj", "sourov", "sauma", "riya", "gouyrab"];
      names.forEach(name => lobby.registerPlayer({ name }));

      const { isFull } = lobby.registerPlayer({ name: "qasim" });

      assert.strictEqual(isFull, true);
    });
  });

  describe("getAllPlayers", () => {
    it("should give all player details present in the lobby", () => {
      const lobby = new Lobby({ maxPlayers: 3 });
      const names = ["milan", "raj", "sourov"];
      names.forEach(name => lobby.registerPlayer({ name }));

      const expectedPlayerDetails = [
        { name: "milan", playerId: 1 },
        { name: "raj", playerId: 2 },
        { name: "sourov", playerId: 3 }
      ];

      assert.deepStrictEqual(lobby.getAllPlayers(), expectedPlayerDetails);
    });
  });

  describe("startGame", () => {
    it("Should Start Game", context => {
      const start = context.mock.fn();
      const game = { start };

      const lobby = new Lobby({ maxPlayers: 3 });
      lobby.startGame(game);
      
      assert.ok(lobby.status().isGameStarted);
    });
  });
});
