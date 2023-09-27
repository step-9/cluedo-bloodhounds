const lodash = require("lodash");

const validTiles = require("../resources/valid-tiles.json");
const rooms = require("../resources/rooms.json");
const staircase = require("../resources/staircase.json");
const cardsData = require("../resources/cards.json");
const initialPositions = require("../resources/initial-positions.json");

const Cards = require("./models/cards");
const Game = require("./models/game");
const Players = require("./models/players");
const Player = require("./models/player");
const Board = require("./models/board");

const makeCards = cardsData => {
  const { suspect, weapon, room } = cardsData;
  const cards = {};
  cards.suspect = suspect.map(title => ({ type: "suspect", title }));
  cards.weapon = weapon.map(title => ({ type: "weapon", title }));
  cards.room = room.map(title => ({ type: "room", title }));

  return cards;
};

const getCardsAssigner = cards => {
  return (playerInfo, playerIndex) => {
    return { ...playerInfo, cards: cards[playerIndex] };
  };
};

const getCharacterAssigner = characters => {
  return (playerInfo, playerIndex) => {
    const character = characters[playerIndex];

    return {
      ...playerInfo,
      character,
      position: initialPositions[character]
    };
  };
};

const formatLobbyDetails = lobbyDetails =>
  lobbyDetails.map(({ name, playerId }) => ({ name, id: +playerId }));

const shuffleAndDealCards = (playersData, cards) => {
  const noOfPlayers = playersData.length;
  const shuffledCardChunks = cards.shuffleRemaining(noOfPlayers);

  return playersData.map(getCardsAssigner(shuffledCardChunks));
};

const assignCharacters = (playersData, shuffler) => {
  const characters = cardsData.suspect;
  return shuffler.shuffle(playersData).map(getCharacterAssigner(characters));
};

const setupGame = (playersData, cards, shuffler) => {
  const killingCombination = cards.getKillingCombination();
  const playersInfoWithCharacter = assignCharacters(playersData, shuffler);
  const playersInfo = shuffleAndDealCards(playersInfoWithCharacter, cards);
  const playerInstances = playersInfo.map(playerInfo =>
    new Player(playerInfo).setupInitialPermissions()
  );
  const players = new Players(playerInstances);

  return { players, killingCombination };
};

const startGame = (lobbyDetails, lobbyId, req) => {
  const { lobbies } = req.app.context;
  const lobby = lobbies.find(lobbyId);
  const board = new Board({
    rooms,
    validTiles,
    initialPositions: { ...initialPositions },
    staircase
  });
  const cards = new Cards(makeCards(cardsData), lodash);

  const playersInfo = formatLobbyDetails(lobbyDetails);
  const { players, killingCombination } = setupGame(playersInfo, cards, lodash);

  const game = new Game({ players, cards, killingCombination, board });
  req.app.context.games[lobbyId] = game;

  lobby.startGame(game);
};

module.exports = { startGame };
