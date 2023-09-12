const Card = require("../models/card");

const toObject = keyValuePairs => Object.fromEntries(keyValuePairs);
const createCardOf = type => cardTitle => new Card(type, cardTitle);

const createCardSets = ([type, cardTitles]) => {
  const cardInstances = cardTitles.map(createCardOf(type));
  return [type, cardInstances];
};

const createCards = cardsInfo => {
  const typeCardsPairs = Object.entries(cardsInfo);
  return toObject(typeCardsPairs.map(createCardSets));
};

module.exports = { createCards };
