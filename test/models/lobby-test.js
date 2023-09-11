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
});
