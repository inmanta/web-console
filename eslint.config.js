import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import _import from "eslint-plugin-import";
import jestDom from "eslint-plugin-jest-dom";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    // Ignore files/folders
    ignores: ["**/dist", "**/.yarn"],
  },

  // Apply recommended configurations
  ...tseslint.configs.recommended,
  ...fixupConfigRules(compat.extends("plugin:prettier/recommended")),
  eslintConfigPrettier,
  {
    plugins: {
      "jest-dom": fixupPluginRules(jestDom),
      import: fixupPluginRules(_import),
      react: eslintPluginReact,
      "react-hooks": fixupPluginRules(eslintPluginReactHooks),
      "testing-library": fixupPluginRules({ rules: testingLibrary.rules }),
      "@stylistic": stylisticTs,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
      },

      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },

      "import/resolver": {
        typescript: {
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        },

        webpack: "webpack",
      },
    },

    rules: {
      "react/display-name": "off",
      "import/no-named-as-default-member": "off",
      "import/no-unresolved": "error",
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],

      "@typescript-eslint/no-empty-function": [
        "error",
        { allow: ["arrowFunctions"] },
      ],

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],

          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
            {
              pattern: "react*",
              group: "external",
              position: "before",
            },
          ],

          pathGroupsExcludedImportTypes: ["react"],

          alphabetize: {
            order: "asc",
          },
        },
      ],

      "@stylistic/padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: ["enum", "interface", "type", "return", "function", "class"],
        },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
      ],

      "@stylistic/lines-around-comment": [
        "error",
        {
          beforeBlockComment: true,
          allowEnumStart: true,
          allowInterfaceStart: true,
          allowModuleStart: true,
          allowTypeStart: true,
          allowObjectStart: true,
          allowBlockStart: true,
          allowArrayStart: true,
        },
      ],

      "@stylistic/indent": ["error", 2],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/space-before-blocks": ["error", "always"],
      "@stylistic/space-before-function-paren": ["error", "always"],
      "@stylistic/space-infix-ops": "error",
      "@stylistic/keyword-spacing": "error",
      "@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
      "@stylistic/comma-spacing": "error",
      "@stylistic/func-call-spacing": "error",
    },
  },

  {
    files: ["**/*.tsx"],

    rules: {
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*webpack*", "**/*jest.polyfills*", "**/*cypress.config*"],

    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["cypress/**/*"],

    rules: {
      "testing-library/await-async-utils": "off",
    },
  },
];
