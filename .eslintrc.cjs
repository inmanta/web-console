module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  plugins: ["testing-library", "jest-dom"],
  extends: [
    "plugin:testing-library/dom",
    "plugin:jest-dom/recommended",
    /**
     * Uses the recommended rules from @eslint-plugin-react
     */
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    /**
     * Uses the recommended rules from the @typescript-eslint/eslint-plugin
     */
    "plugin:@typescript-eslint/recommended",
    /**
     * Enables eslint-plugin-prettier and eslint-config-prettier.
     * This will display prettier errors as ESLint errors.
     * Make sure this is always the last configuration in the extends array.
     */
    "plugin:prettier/recommended",
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    "react/display-name": "off",
  },
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        "react/prop-types": "off",
      },
    },
    {
      files: ["**/*webpack*", ".storybook/**/*.{cjs,js}"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: ["cypress/**/*"],
      rules: {
        "testing-library/await-async-utils": "off",
      },
    },
  ],
};
