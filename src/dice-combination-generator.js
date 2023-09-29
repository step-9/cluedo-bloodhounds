const { cycler } = require("./models/dice-roller");
const { random } = require("lodash");

const getDiceCombinationGenerator = () => {
  const rolls = [
    [6, 5],
    [5, 4],
    [3, 6],
    [5, 5],
    [4, 3]
  ];

  const diceCombinationGenerator = cycler(rolls);

  return diceCombinationGenerator;
};

const randomNumberGenerator = {
  next: () => ({ value: [random(1, 6), random(1, 6)] })
};

module.exports = { randomNumberGenerator, getDiceCombinationGenerator };
