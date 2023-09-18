function* cycler(vals) {
  let index = 0;
  while (true) {
    yield vals[index];
    index = (index + 1) % vals.length;
  }
}

const rollDice = diceCombinationGenerator => {
  return diceCombinationGenerator.next().value;
};

module.exports = { rollDice, cycler };
