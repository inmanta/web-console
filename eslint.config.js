import { fixupPluginRules } from "@eslint/compat";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import tsParser from "@typescript-eslint/parser";
import _import from "eslint-plugin-import";
import jestDom from "eslint-plugin-jest-dom";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import tseslint from "typescript-eslint";
import { basePath, importBoundaryZones, testImportBoundaryZones } from "./eslint.layers.js";

/**
 * Tests and the helpers that only tests use.
 */
const testFiles = [
  "{src,packages,apps}/**/*.test.ts",
  "{src,packages,apps}/**/*.test.tsx",
  "{src,packages,apps}/**/*.spec.ts",
  "{src,packages,apps}/**/*.spec.tsx",
  "packages/test-utils/**/*.{ts,tsx}",
  "src/Slices/*/Test/**/*.{ts,tsx}",
  "{src,packages,apps}/**/Mock.ts",
  "{src,packages,apps}/**/Mock/**/*.{ts,tsx}",
  "{src,packages,apps}/**/Spec/**/*.{ts,tsx}",
];

export default [
  {
    // Ignore files/folders
    ignores: ["**/dist", "**/.yarn"],
  },

  // Apply recommended configurations
  ...tseslint.configs.recommended,
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
        version: "detect",
      },

      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },

      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          moduleDirectory: ["node_modules", "src/"],
        },
      },
    },

    rules: {
      "react/display-name": "off",
      "import/no-named-as-default-member": "off",
      // monaco-graphql is aliased via Vite to @graphiql/react/node_modules/monaco-graphql,
      // which ESLint's TypeScript resolver cannot follow. Vite-specific ?worker query
      // suffixes are also not resolvable by any ESLint resolver.
      "import/no-unresolved": ["error", { ignore: ["^monaco-graphql"] }],
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

      "@typescript-eslint/no-empty-function": ["error", { allow: ["arrowFunctions"] }],

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
              pattern: "@inmanta/web-console-*{,/**}",
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

      "@stylistic/semi": ["warn", "always"],
      "@stylistic/quotes": ["warn", "double", { avoidEscape: true }],
      "@stylistic/space-before-blocks": ["warn", "always"],
      "@stylistic/space-infix-ops": "warn",
      "@stylistic/keyword-spacing": "warn",
      "@stylistic/comma-spacing": "warn",
      "@stylistic/func-call-spacing": "warn",

      curly: ["error", "all"],

      "padding-line-between-statements": [
        "warn",
        { blankLine: "always", prev: "*", next: "return" },
      ],
    },
  },

  {
    files: ["**/*.tsx"],
    rules: {
      "react/prop-types": "off",
    },
  },
  {
    // The messages are registered when the app starts, after its modules have loaded, and the
    // messages of a feature loaded as a plugin even later.
    files: ["{src,packages,apps}/**/*.ts", "{src,packages,apps}/**/*.tsx"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name='words']:not(:function CallExpression, PropertyDefinition[static=false] CallExpression)",
          message:
            "Don't call words() while the module loads: its messages may not be registered yet. Call it in a function, e.g. turn the constant into a getter.",
        },
      ],
    },
  },
  {
    // The layer rules of the composition architecture (#7451) for the code that ships.
    files: ["{src,packages,apps}/**/*.ts", "{src,packages,apps}/**/*.tsx"],
    ignores: testFiles,
    rules: {
      "import/no-restricted-paths": ["error", { basePath, zones: importBoundaryZones }],
    },
  },
  {
    // The same layer rules for tests and test helpers, which may also import the test helpers.
    files: testFiles,
    rules: {
      "import/no-restricted-paths": ["error", { basePath, zones: testImportBoundaryZones }],
    },
  },
  {
    // Only the composer depends on JointJS, so that an app without it builds without the licence.
    files: ["{src,packages,apps}/**/*.ts", "{src,packages,apps}/**/*.tsx"],
    ignores: ["packages/features/composer/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@joint/*", "@rappidcss"],
              message: "Only the composer feature (packages/features/composer) imports JointJS.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "cypress/**/*"],
    rules: {
      "@stylistic/quotes": ["warn", "double", { avoidEscape: true }],
    },
  },
  {
    files: ["**/*cypress.config*", "**/*vite.config*"],
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
