const { describe, it } = require("node:test");
const assert = require("assert");
const Room = require("../../src/models/room");

describe("Room", () => {
  describe("registerPlayer", () => {
    it("should register player when the room is not full", () => {
      const lobby = new Room({ maxPlayers: 3 });
      const { isFull, playerId } = lobby.registerPlayer({ name: "gourab" });
      assert.strictEqual(isFull, false);
      assert.strictEqual(playerId, 1);
    });

    it("should not register player if the room is full", () => {
      const lobby = new Room({ maxPlayers: 1 });
      lobby.registerPlayer({ name: "milan" });
      const { isFull } = lobby.registerPlayer({ name: "gourab" });
      assert.strictEqual(isFull, true);
    });

    it("should create a room of 6 players when max players is not provided", () => {
      const lobby = new Room({});
      const names = ["milan", "raj", "sourov", "sauma", "riya", "gouyrab"];
      names.forEach(name => lobby.registerPlayer({ name }));

      const { isFull } = lobby.registerPlayer({ name: "qasim" });

      assert.strictEqual(isFull, true);
    });
  });
});
