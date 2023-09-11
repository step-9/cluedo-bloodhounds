const assert = require("assert");
const { describe, it } = require("node:test");
const { dummy } = require("../src/dummy");

describe("dummy", () => {
  it("should return true", () => {
    assert.ok(dummy());
  });
});
