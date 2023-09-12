const { describe, it } = require("node:test");
const assert = require("assert");
const Player = require("../../src/models/player");
const Players = require("../../src/models/players");

const createPlayers = playerNames => {
  return playerNames.map((name, id) => {
    return new Player({ id: id + 1, name, cards: [] });
  });
};

describe("Players", () => {
  describe("getNextPlayer", () => {
    it("should give the next active player", () => {
      const [gourab, milan, riya] = createPlayers(["gourab", "milan", "riya"]);
      const players = new Players([gourab, milan, riya]);
      const nextPlayer = players.getNextPlayer();

      assert.deepStrictEqual(nextPlayer.info(), gourab.info());
    });

    it("should give next active player if the next player is stranded", () => {
      const [gourab, milan, riya] = createPlayers(["gourab", "milan", "riya"]);
      gourab.strand();
      const players = new Players([gourab, milan, riya]);
      const nextPlayer = players.getNextPlayer();

      assert.deepStrictEqual(nextPlayer.info(), milan.info());
    });
  });

  describe("strandPlayer", () => {
    it("should strand the player with the given player id", () => {
      const [gourab, milan, riya] = createPlayers(["gourab", "milan", "riya"]);

      const players = new Players([gourab, milan, riya]);
      players.strandPlayer(1);
      const nextPlayer = players.getNextPlayer();

      assert.deepStrictEqual(nextPlayer.info(), milan.info());
    });

    it("should give an error when tried to strand player with invalid player id", () => {
      const [gourab, milan, riya] = createPlayers(["gourab", "milan", "riya"]);

      const players = new Players([gourab, milan, riya]);
      const result = players.strandPlayer(4);

      assert.ok(result instanceof Error);
    });
  });

  describe("info", () => {
    it("Should give the info off all the players", () => {
      const [gourab, milan, riya] = createPlayers(["gourab", "milan", "riya"]);

      const players = new Players([gourab, milan, riya]);
      const expectedPlayersDetails = [
        {
          cards: [],
          character: undefined,
          currentPosition: undefined,
          id: 1,
          isStranded: false,
          lastSuspicionPosition: null,
          name: "gourab"
        },
        {
          cards: [],
          character: undefined,
          currentPosition: undefined,
          id: 2,
          isStranded: false,
          lastSuspicionPosition: null,
          name: "milan"
        },
        {
          cards: [],
          character: undefined,
          currentPosition: undefined,
          id: 3,
          isStranded: false,
          lastSuspicionPosition: null,
          name: "riya"
        }
      ];
      assert.deepStrictEqual(players.info(), expectedPlayersDetails);
    });
  });
});
