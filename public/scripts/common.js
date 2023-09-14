const isObject = value => typeof value === "object";

const areEqualArray = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => areEqual(value, right[index]));
};

const areEqualObject = (left, right) => {
  const leftEntries = Object.entries(left);
  const rightEntries = Object.entries(right);

  if (leftEntries.length !== rightEntries.length) {
    return false;
  }

  return leftEntries.every(([key, value]) => areEqual(value, right[key]));
};

const areEqual = (left, right) => {
  if (Array.isArray(left) && Array.isArray(right)) {
    return areEqualArray(left, right);
  }

  if (isObject(left) && isObject(right)) {
    return areEqualObject(left, right);
  }

  return left === right;
};
