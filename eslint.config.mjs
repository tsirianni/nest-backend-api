import globals from 'globals';
import eslintJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier/flat';

const ignores = ['**/dist/**/*.{js,d.ts}'];

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  { name: 'Ignore Patterns', ignores },
  {
    name: 'Global definitions',
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'module',
      parser: tsEslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(), // ensures resolution from correct base
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
      prettier,
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'no-unused-vars': 'off', // disable base rule
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      /* Allows empty classes such as modules if they have a decorator */
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowWithDecorator: true,
        },
      ],
    },
  },
  ...tsEslint.configs.strictTypeChecked,
  {
    name: 'Config Prettier (Disables possibly conflicting rules)',
    rules: { ...prettierConfig.rules },
  },
];
