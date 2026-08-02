const browserEnv = require("eslint/conf/environments/browser.js");

module.exports = [
  {
    languageOptions: {
      globals: browserEnv.globals,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    extends: ["eslint:recommended", "plugin:react/recommended"],
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
    },
  },
];