// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  coverageReporters: ["text", "cobertura"],

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ["node_modules", "<rootDir>/src"],

  // An array of file extensions your modules use
  moduleFileExtensions: ["ts", "tsx", "js"],

  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "@/(.*)": "<rootDir>/src/$1",
    "@S/(.*)": "<rootDir>/src/Slices/$1",
    "^lodash-es$": "<rootDir>/node_modules/lodash/index.js", // Use CommonJS version of lodash in the test cases instead of ESM
  },

  // A preset that is used as a base for Jest's configuration
  preset: "ts-jest/presets/js-with-ts",

  setupFiles: ["<rootDir>/jestSetup.ts"],

  // The path to a module that runs some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/jestSetupAfterEnv.js"],

  // The test environment that will be used for testing.
  testEnvironment: "jsdom",

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/*.(spec|test).(ts|tsx)"],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  reporters: ["default", "jest-junit"],

  // The react-syntax-highlighter and @inmanta/rappid esm modules have to be handled by jest
  transformIgnorePatterns: [
    "node_modules/(?!react-syntax-highlighter|@inmanta/rappid)",
  ],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
