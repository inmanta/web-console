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
  "packages/features/*/src/Slices/*/Test/**/*.{ts,tsx}",
  "{src,packages,apps}/**/Mock.ts",
  "{src,packages,apps}/**/Mock/**/*.{ts,tsx}",
  "{src,packages,apps}/**/Spec/**/*.{ts,tsx}",
];

// The files that may import a workspace's devDependencies: the test files above and the test setup.
const devDependencyFiles = [
  ...testFiles,
  "apps/web-console/src/test-setup.ts",
  "packages/features/composer/src/**/globalTestMocks.ts",
];

export default [
  {
    // Ignore files/folders
    ignores: ["**/dist", "**/.yarn", ".tsbuild"],
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

      // The shared images in public/images, not a package: no-extraneous-dependencies skips them.
      "import/internal-regex": "^@images/",

      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          // Without "types": the workspace packages list their TypeScript fallbacks under
          // "types", and the resolver only tries the first one. "default" ("./src/*") lets
          // it find the file or the folder's index itself.
          conditionNames: ["import", "require", "node", "browser", "default"],
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
              pattern: "@inmanta/web-console-*{,/**}",
              group: "internal",
            },
            {
              pattern: "@images/**",
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
    // Only the composer depends on JointJS, so that an app without it builds without the licence,
    // and only the GraphiQL feature depends on the GraphiQL packages. This rule gives the clearest
    // message for a static import; the Yarn constraints (yarn.config.cjs) and
    // import/no-extraneous-dependencies below also catch import() and a dependency in the wrong
    // package.json.
    files: ["{src,packages,apps}/**/*.ts", "{src,packages,apps}/**/*.tsx"],
    ignores: ["packages/features/composer/**", "packages/features/graphiql/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@joint/*", "@rappidcss"],
              message: "Only the composer feature (packages/features/composer) imports JointJS.",
            },
            {
              group: [
                "graphiql",
                "graphiql/*",
                "@graphiql/*",
                "monaco-graphql",
                "monaco-graphql/*",
              ],
              message:
                "Only the GraphiQL feature (packages/features/graphiql) imports the GraphiQL packages.",
            },
          ],
        },
      ],
    },
  },
  {
    // Every workspace declares the packages it imports in its own package.json (#7461), so that
    // installing one app only installs what its packages use. Tests and test helpers may use
    // devDependencies. includeTypes: a type-only import needs the package installed too.
    files: ["{packages,apps}/**/*.{ts,tsx,js}"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: devDependencyFiles,
          peerDependencies: false,
          optionalDependencies: false,
          includeTypes: true,
        },
      ],
    },
  },
  {
    // The test helpers are what other packages' tests import, so what they use are dependencies
    // of test-utils. Only its own tests may use its devDependencies.
    files: ["packages/test-utils/**/*.{ts,tsx,js}"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: ["packages/test-utils/**/*.test.{ts,tsx}"],
          peerDependencies: false,
          optionalDependencies: false,
          includeTypes: true,
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
