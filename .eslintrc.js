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
          "i",
          "j",
          "on",
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
  overrides: [
    {
      files: [
        "public/scripts/html-generator.js",
        "public/scripts/loader.js",
        "public/scripts/lobby.js",
        "public/scripts/views/view.js",
        "public/scripts/views/popup-view.js",
        "public/scripts/game-page.js",
        "public/scripts/game-controller.js",
        "public/scripts/game-service.js",
        "public/scripts/event-emitter.js",
        "public/scripts/clue-sheet.js"
      ],
      rules: {
        "no-undef": "off",
        "no-unused-vars": "off"
      }
    }
  ],

  parserOptions: {
    ecmaVersion: "latest"
  }
};
