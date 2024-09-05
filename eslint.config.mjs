import globals from 'globals';
import eslintJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const ignores = ['**/dist/**/*.{js,d.ts}', '**/node_modules/**/*'];

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  {
    name: 'Global definitions',
    ignores,
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'module',
      parser: tsEslint.parser,
    },
    plugins: {
      typescript: tsEslint.plugin,
      prettier,
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  ...tsEslint.configs.recommended.map((config) => ({ ...config, ignores })),
  prettierConfig,
];
