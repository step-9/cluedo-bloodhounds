const { describe, it } = require("node:test");
const assert = require("assert");
const Player = require("../../src/models/player");
const Players = require("../../src/models/players");

const createPlayers = playerNames => {
  return playerNames.map((name, id) => {
    return new Player({ id: id + 1, name, cards: [] });
  });
};

const DAGGER = { type: "weapon", title: "dagger" };
const MUSTARD = { type: "suspect", title: "mustard" };
const SPANNER = { type: "weapon", title: "spanner" };
const LOUNGE = { type: "room", title: "lounge" };

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

    it("should throw an error when tried to strand player with invalid player id", () => {
      const [gourab, milan, riya] = createPlayers(["gourab", "milan", "riya"]);

      const players = new Players([gourab, milan, riya]);

      assert.throws(
        () => {
          players.strandPlayer(4);
        },
        {
          name: "Error",
          message: "Invalid Player Id"
        }
      );
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
          id: 1,
          isStranded: false,
          lastSuspicionPosition: "",
          name: "gourab"
        },
        {
          cards: [],
          character: undefined,
          id: 2,
          isStranded: false,
          lastSuspicionPosition: "",
          name: "milan"
        },
        {
          cards: [],
          character: undefined,
          id: 3,
          isStranded: false,
          lastSuspicionPosition: "",
          name: "riya"
        }
      ];

      assert.deepStrictEqual(players.info(), expectedPlayersDetails);
    });
  });

  describe("add", () => {
    it("Should add a new Player", () => {
      const gourab = new Player({ id: 1, name: "gourab", cards: [] });
      const players = new Players();
      players.add(gourab);

      const expectedPlayersInfo = [
        {
          cards: [],
          id: 1,
          name: "gourab",
          character: undefined,
          isStranded: false,
          lastSuspicionPosition: ""
        }
      ];

      assert.deepStrictEqual(players.info(), expectedPlayersInfo);
    });
  });

  describe("getLastSuspicionPosition", () => {
    it("should give the position of the player mapped to player id", () => {
      const gourab = new Player({
        name: "gourab",
        id: 1,
        position: { x: 0, y: 0 },
        cards: []
      });

      const raj = new Player({
        name: "raj",
        id: 2,
        position: { x: 4, y: 4 },
        cards: []
      });
      const players = new Players([gourab, raj]);

      players.updateLastSuspicionPosition(1, "lounge");
      const lastSuspicionPosition = players.getLastSuspicionPosition(1);

      assert.strictEqual(lastSuspicionPosition, "lounge");
    });

    it("should throw an error if player doesn't exist", () => {
      const gourab = new Player({
        name: "gourab",
        id: 1,
        position: { x: 0, y: 0 },
        cards: []
      });

      const raj = new Player({
        name: "raj",
        id: 2,
        position: { x: 4, y: 4 },
        cards: []
      });
      const players = new Players([gourab, raj]);

      assert.throws(() => players.updateLastSuspicionPosition(3, "lounge"));
      assert.throws(() => players.getLastSuspicionPosition(3));
    });
  });

  describe("ruleOutSuspicion", () => {
    it("should give player who invalidates the suspicion combination along with matching cards", () => {
      const gourab = new Player({
        name: "gourab",
        id: 1,
        position: { x: 0, y: 0 },
        cards: [DAGGER, MUSTARD]
      });

      const raj = new Player({
        name: "raj",
        id: 2,
        position: { x: 4, y: 4 },
        cards: [SPANNER, LOUNGE]
      });
      const players = new Players([gourab, raj]);

      const invalidationResult = players.ruleOutSuspicion(1, [SPANNER, LOUNGE]);

      assert.deepStrictEqual(invalidationResult, {
        invalidatedBy: 2,
        matchingCards: [SPANNER, LOUNGE]
      });
    });

    it("should give nothing when no player has invalidated the suspicion combination", () => {
      const gourab = new Player({
        name: "gourab",
        id: 1,
        position: { x: 0, y: 0 },
        cards: [DAGGER, LOUNGE]
      });

      const raj = new Player({
        name: "raj",
        id: 2,
        position: { x: 4, y: 4 },
        cards: [SPANNER]
      });
      const players = new Players([gourab, raj]);

      assert.deepStrictEqual(players.ruleOutSuspicion(1, [MUSTARD]), {});
    });
  });
});
