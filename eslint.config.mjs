import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import nPlugin from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Use FlatCompat to convert the legacy eslint-config-standard config,
// then override the `n` plugin with the ESM-imported version (v18 is ESM-only).
const standardConfigs = compat.extends('standard').map(c => {
  if (c.plugins && c.plugins.n) {
    return { ...c, plugins: { ...c.plugins, n: nPlugin } };
  }
  return c;
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'website/**', 'scripts/**'],
  },

  // Only lint TypeScript files (matching original --ext .ts behavior)
  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.es2021,
        ...globals.node,
        BigInt: true,
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      n: nPlugin,
      promise: promisePlugin,
    },

    settings: {
      ...importPlugin.flatConfigs.typescript.settings,
    },

    rules: {
      // Base recommended rules
      ...js.configs.recommended.rules,

      // Standard style rules (from eslint-config-standard)
      ...standardConfigs.reduce((acc, c) => ({ ...acc, ...(c.rules || {}) }), {}),

      // Prettier config (disables formatting rules)
      ...prettierConfig.rules,

      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,

      // Import typescript rules
      ...importPlugin.flatConfigs.typescript.rules,

      // Rule overrides
      'no-empty': 'off',
      'no-console': 'off',
      'no-prototype-builtins': 'off',
      'no-useless-constructor': 'off',
      'no-useless-escape': 'off',
      'no-undef': 'off',
      'no-dupe-class-members': 'off',
      'dot-notation': 'off',
      'no-use-before-define': 'off',
      'import/extensions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'default-param-last': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['**/*.test.ts', '**/*.spec.ts'] },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'graphql',
              importNames: ['ExecutionResult', 'ExecutionArgs', 'execute', 'subscribe'],
              message:
                'Please use `execute` and `subscribe` from `@graphql-tools/executro` instead.',
            },
          ],
        },
      ],
    },
  },

  // Test files: enable jest globals and disable certain rules
  {
    files: ['**/{test,tests,testing}/**/*.{ts,js}', '*.{spec,test}.{ts,js}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // Report unused disable directives
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];

