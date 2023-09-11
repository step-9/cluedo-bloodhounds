module.exports = {
  env: {
    node: true,
    browser: true,
    es2022: true
  },

  extends: "eslint:recommended",

  rules: {
    indent: ["error", 2],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-constructor-return": ["error", "always"],
    "no-duplicate-imports": "error",
    "no-unmodified-loop-condition": "error",
    "no-unreachable-loop": "error",
    "no-unused-private-class-members": "error",
    "no-unused-vars": ["warn", { destructuredArrayIgnorePattern: "^_" }],
    "id-length": [
      "error",
      {
        exceptions: [
          "a",
          "b",
          "x",
          "y",
          "z",
          "id",
          "#id",
          "_",
          "fs",
          "js",
          "it",
          "to"
        ],
        min: 3,
        max: 28
      }
    ]
  },

  parserOptions: {
    ecmaVersion: "latest"
  }
};
