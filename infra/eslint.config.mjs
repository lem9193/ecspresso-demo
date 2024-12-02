import pluginJs from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-namespace': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^aws-cdk-lib'],
            ['^constructs'],
            ['^aws-cdk-lib/(.*)'],
            ['^@?\\w'],
            ['@/(.*)'],
            ['^[./]'],
          ],
        },
      ],
      'simple-import-sort/exports': ['error'],
    },
  },
];
