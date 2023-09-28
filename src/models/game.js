class Game {
  #board;
  #players;
  #killingCombination;
  #currentPlayer;
  #lastAccusationCombination;
  #lastSuspicion;
  #lastDiceCombination;
  #possiblePositions;
  #action;
  #lastAction;

  #isGameWon;
  #isGameOver;
  #isAccusing;
  #isSuspecting;

  constructor({ players, board, killingCombination }) {
    this.#board = board;
    this.#players = players;
    this.#killingCombination = killingCombination;
    this.#currentPlayer = null;
    this.#possiblePositions = {};
    this.#action = "turnEnded";
    this.#lastDiceCombination = [0, 0];
    this.#isGameWon = this.#isGameOver = false;
    this.#isAccusing = this.#isSuspecting = false;
    this.#lastSuspicion = {};
  }

  static load(gameState) {
    const {
      players,
      board,
      killingCombination,
      possiblePositions = {},
      action = "turnEnded",
      lastDiceCombination = [0, 0],
      isAccusing = false,
      isSuspecting = false,
      lastSuspicion = {}
    } = gameState;

    const game = new Game({ players, board, killingCombination });

    game.#possiblePositions = possiblePositions;
    game.#action = action;
    game.#lastDiceCombination = lastDiceCombination;
    game.#isAccusing = isAccusing;
    game.#isSuspecting = isSuspecting;
    game.#lastSuspicion = lastSuspicion;

    game.start();

    return game;
  }

  #areAllPlayersStranded() {
    const totalPlayers = this.#players.info().length;
    const totalStrandedPlayers = this.#players.getStrandedPlayerIds().length;
    return totalPlayers === totalStrandedPlayers;
  }

  getCardsOfPlayer(playerId) {
    const player = this.#players.findPlayer(+playerId);
    return player.info().cards;
  }

  #setupPermissions() {
    this.#currentPlayer.setupInitialPermissions();

    const lastSuspicionPosition =
      this.#currentPlayer.getLastSuspicionPosition();
    const currentPlayerCharacter = this.#currentPlayer.info().character;
    const currentPosition =
      this.#board.getCharacterPositions()[currentPlayerCharacter];

    const room = this.#board.getRoomDetails(currentPosition);
    if (!room) return;

    if (room[0] !== lastSuspicionPosition) {
      this.#currentPlayer.allow("suspect");
      this.#currentPlayer.updateLastSuspicionPosition(room[0]);
      return;
    }

    if (room[1].passage) {
      this.#currentPlayer.allow("movePawn");
    }
  }

  changeTurn() {
    this.#action = "turnEnded";
    this.#currentPlayer = this.#players.getNextPlayer();
    this.#setupPermissions();
  }

  toggleIsAccusing() {
    this.#isAccusing = true;
    this.#lastAction = this.#action;
    this.#action = "accusing";
    this.#currentPlayer.startAccusing();
  }

  toggleIsSuspecting() {
    this.#isSuspecting = true;
    this.#action = "suspecting";
    this.#currentPlayer.revoke("suspect");
    this.#currentPlayer.revoke("rollDice");
    this.#currentPlayer.allow("endTurn");
  }

  resetPermissions() {
    this.#currentPlayer.setupInitialPermissions();
    this.#currentPlayer.allow("movePawn");
  }

  state() {
    return {
      currentPlayerId: this.#currentPlayer.id,
      action: this.#action,
      isGameOver: this.#isGameOver
    };
  }

  movePawn(tileCoordinates, playerId) {
    const isCurrentPlayer = playerId === this.#currentPlayer.id;
    const { canMovePawn, canRollDice } = this.#currentPlayer.permissions;

    if (!isCurrentPlayer || !canMovePawn) return { isMoved: false };

    const stepCount = this.#lastDiceCombination.reduce((sum, a) => sum + a, 0);

    const currentPlayerCharacter = this.#currentPlayer.info().character;

    const { hasMoved, room } = this.#board.updatePosition(
      stepCount,
      currentPlayerCharacter,
      tileCoordinates,
      canRollDice
    );

    if (hasMoved) {
      this.#currentPlayer.hasMoved();
      this.#action = "updateBoard";
      const result = { isMoved: true };
      this.#currentPlayer.updateLastSuspicionPosition("");

      if (room) {
        result.canSuspect = true;
        result.room = room;
        this.#currentPlayer.updateLastSuspicionPosition(room);
      }

      return result;
    }

    return { isMoved: false };
  }

  #getRoomDetails() {
    const characterPositions = this.#board.getCharacterPositions();
    const currentCharacter = this.#currentPlayer.info().character;
    const roomDetails = this.#board.getRoomDetails(
      characterPositions[currentCharacter]
    );

    const [name, { passage }] = roomDetails || ["", { passage: null }];
    return { name, passage };
  }

  playersInfo() {
    const permissions = this.#currentPlayer.permissions;
    const { name, passage } = this.#getRoomDetails();

    return {
      players: this.#players.info(),
      currentPlayerId: this.#currentPlayer.id,
      strandedPlayerIds: this.#players.getStrandedPlayerIds(),
      characterPositions: this.#board.getCharacterPositions(),
      diceRollCombination: this.#lastDiceCombination,
      isAccusing: this.#isAccusing,
      isSuspecting: this.#isSuspecting,
      room: { name, passage },
      ...permissions
    };
  }

  getLastAccusationCombination() {
    return this.#lastAccusationCombination;
  }

  getLastSuspicionCombination() {
    return this.#lastSuspicion.combination;
  }

  validateSuspicion(playerId, suspicionCombination) {
    this.#lastSuspicion.combination = suspicionCombination;
    this.#lastSuspicion.suspectorId = playerId;
    this.#action = "suspected";
  }

  ruleOutSuspicion() {
    const suspicionCombination = Object.entries(
      this.#lastSuspicion.combination
    ).map(([type, title]) => ({ type, title }));

    return this.#players.ruleOutSuspicion(
      this.#currentPlayer.id,
      suspicionCombination
    );
  }

  getGameOverInfo() {
    return {
      killingCombination: this.#killingCombination,
      isGameWon: this.#isGameWon
    };
  }

  getLastDiceCombination() {
    return this.#lastDiceCombination;
  }

  move(suspect, room) {
    this.#board.move(suspect, room);
  }

  validateAccuse(combination) {
    this.#lastAccusationCombination = combination;
    const killingCombinationCards = Object.entries(this.#killingCombination);

    this.#isGameWon = killingCombinationCards.every(([type, title]) => {
      return title === combination[type];
    });

    this.#isGameOver = this.#isGameWon;

    if (!this.#isGameWon) {
      this.#currentPlayer.strand();
      const strandedCharacter = this.#currentPlayer.info().character;
      this.#board.moveToStaircase(strandedCharacter);
      this.#isGameOver = this.#areAllPlayersStranded();
    }

    this.#isAccusing = false;
    this.#action = "accused";
    this.#currentPlayer.allow("endTurn");

    return {
      isWon: this.#isGameWon,
      killingCombination: { ...this.#killingCombination }
    };
  }

  getCharacterPositions() {
    return this.#board.getCharacterPositions();
  }

  updateDiceCombination(diceCombination) {
    this.#action = "diceRolled";
    this.#currentPlayer.allow("movePawn");
    this.#currentPlayer.revoke("rollDice");
    this.#lastDiceCombination = diceCombination;
  }

  updatePossiblePositions(possiblePositions) {
    this.#possiblePositions = possiblePositions;
  }

  getPossiblePositions() {
    return this.#possiblePositions;
  }

  findPossiblePositions(stepCount) {
    const currentPlayerCharacter = this.#currentPlayer.info().character;

    const possiblePositions = this.#board.getPossibleTiles(
      stepCount,
      currentPlayerCharacter
    );

    if (Object.keys(possiblePositions).length === 0) {
      this.#currentPlayer.revoke("movePawn");
      this.#currentPlayer.allow("endTurn");
    }

    return possiblePositions;
  }

  start() {
    this.#currentPlayer = this.#players.getNextPlayer();
  }

  getLastSuspicionPosition(playerId) {
    return this.#players.getLastSuspicionPosition(playerId);
  }

  invalidateSuspicion(invalidatorId, cardTitle) {
    const { combination } = this.#lastSuspicion;
    const isCardPresent = Object.values(combination).includes(cardTitle);
    if (!isCardPresent) throw new Error("Card not present");

    this.#lastSuspicion.invalidatorId = invalidatorId;
    this.#lastSuspicion.invalidatedCard = cardTitle;
    this.#action = "invalidated";
  }

  getLastSuspicion() {
    return this.#lastSuspicion;
  }

  cancelAccusation() {
    this.#isAccusing = false;
    this.#currentPlayer.cancelAccusing();
    this.#action = "accusation-cancelled";
    setTimeout(() => (this.#action = this.#lastAction), 600);
  }

  hasPlayer(playerId) {
    return !!this.#players.findPlayer(playerId);
  }
}

module.exports = Game;
