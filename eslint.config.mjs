import prettier from 'eslint-plugin-prettier';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: [
      'browserscripts/*',
      'tools/*',
      'test/data/*',
      'docker/webpagereplay/*',
      'vendor/*'
    ]
  },
  ...compat.extends('eslint:recommended', 'plugin:unicorn/recommended'),
  {
    plugins: {
      prettier,
      unicorn
    },

    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 'latest',
      sourceType: 'module'
    },

    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'none',
          arrowParens: 'avoid',
          embeddedLanguageFormatting: 'off'
        }
      ],

      'no-extra-semi': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      'no-unexpected-multiline': 'off',
      'no-return-await': 'error',
      'require-atomic-updates': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off'
    }
  }
];
