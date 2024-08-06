import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import testingLibrary from "eslint-plugin-testing-library";
import jestDom from "eslint-plugin-jest-dom";
import _import from "eslint-plugin-import";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/dist"],
}, ...fixupConfigRules(compat.extends(
    "plugin:testing-library/dom",
    "plugin:jest-dom/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
)), {
    plugins: {
        "testing-library": fixupPluginRules(testingLibrary),
        "jest-dom": fixupPluginRules(jestDom),
        import: fixupPluginRules(_import),
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

            webpack: "webpack",
        },
    },

    rules: {
        "react/display-name": "off",
        "import/no-named-as-default-member": "off",
        "import/no-unresolved": "error",
        "no-unused-vars": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        }],

        "import/order": ["error", {
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

            pathGroups: [{
                pattern: "@/**",
                group: "internal",
            }, {
                pattern: "react*",
                group: "external",
                position: "before",
            }],

            pathGroupsExcludedImportTypes: ["react"],

            alphabetize: {
                order: "asc",
            },
        }],
    },
}, {
    files: ["**/*.tsx", "**/*.cjs", "**/*.js", "**/*.jsx", "**/*.ts" ],

    rules: {
        "react/prop-types": "off",
    },
}, {
    files: ["**/*webpack*"],

    rules: {
        "@typescript-eslint/no-var-requires": "off",
    },
}, {
    files: ["cypress/**/*"],

    rules: {
        "testing-library/await-async-utils": "off",
    },
}];