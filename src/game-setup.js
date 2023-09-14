const lodash = require("lodash");

const Cards = require("./models/cards");
const Game = require("./models/game");
const Players = require("./models/players");
const { createCards } = require("./utils/card-generator");
const Player = require("./models/player");
const cardsData = require("../resources/cards.json");

const getCardsAssigner = cards => {
  return (playerInfo, playerIndex) => {
    return { ...playerInfo, cards: cards[playerIndex] };
  };
};

const getCharacterAssigner = characters => {
  return (playerInfo, playerIndex) => {
    return { ...playerInfo, character: characters[playerIndex] };
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
  const playerInstances = playersInfo.map(playerInfo => new Player(playerInfo));
  const players = new Players(playerInstances);

  return { players, killingCombination };
};

const startGame = (lobbyDetails, req) => {
  const { lobby } = req.app.context;
  const cardsLookup = createCards(cardsData);
  const cards = new Cards(cardsLookup, lodash);

  const playersInfo = formatLobbyDetails(lobbyDetails);
  const { players, killingCombination } = setupGame(playersInfo, cards, lodash);

  const game = new Game({ players, cards, killingCombination });
  req.app.context.game = game;

  lobby.startGame(game);
};

module.exports = { startGame };
