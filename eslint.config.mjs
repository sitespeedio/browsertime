import prettier from 'eslint-plugin-prettier';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import js from '@eslint/js';

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
  js.configs.recommended,
  unicorn.configs.recommended,
  {
    plugins: {
      prettier
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
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off',
      'require-atomic-updates': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-immediate-mutation': 'off',
      'unicorn/prevent-abbreviations': 'off'
    }
  }
];
