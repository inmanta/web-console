import { fixupPluginRules } from '@eslint/compat';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import jestDom from 'eslint-plugin-jest-dom';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import tseslint from 'typescript-eslint';

export default [
  {
    // Ignore files/folders
    ignores: ['**/dist', '**/.yarn'],
  },

  // Apply recommended configurations
  ...tseslint.configs.recommended,
  {
    plugins: {
      'jest-dom': fixupPluginRules(jestDom),
      import: fixupPluginRules(_import),
      react: eslintPluginReact,
      'react-hooks': fixupPluginRules(eslintPluginReactHooks),
      'testing-library': fixupPluginRules({ rules: testingLibrary.rules }),
      '@stylistic': stylisticTs,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },

      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },

      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        webpack: 'webpack',
      },
    },

    rules: {
      'react/display-name': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'error',
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],

      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['arrowFunctions'] },
      ],

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
            {
              pattern: 'react*',
              group: 'external',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: {
            order: 'asc',
          },
        },
      ],

      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: ['enum', 'interface', 'type', 'return', 'function', 'class'],
        },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],

      '@stylistic/lines-around-comment': [
        'error',
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

      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': ['warn', 'always'],
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/space-before-blocks': ['warn', 'always'],
      '@stylistic/space-before-function-paren': ['warn', 'always'],
      '@stylistic/space-infix-ops': 'warn',
      '@stylistic/keyword-spacing': 'warn',
      '@stylistic/brace-style': ['warn', '1tbs', { 'allowSingleLine': true }],
      '@stylistic/comma-spacing': 'warn',
      '@stylistic/func-call-spacing': 'warn',
    },
  },

  {
    files: ['**/*.tsx'],
    rules: {
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*webpack*', '**/*jest.polyfills*', '**/*cypress.config*'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['cypress/**/*'],
    rules: {
      'testing-library/await-async-utils': 'off',
    },
  },
];
