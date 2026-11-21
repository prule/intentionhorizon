import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'dev-dist',
      'target',
      'playwright-report',
      'test-results',
      'logs',
      'intention-horizon-handoff',
      '.agents',
      '.claude',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  // src only: Playwright's fixture `use` in e2e/ trips the hook rules.
  { files: ['src/**/*.{ts,tsx}'], ...reactHooks.configs.flat.recommended },
  {
    rules: {
      // Destructuring a field away to strip it (`{ order, ...rest }`) is the intent;
      // a leading `_` marks a parameter kept only for its type.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_' },
      ],
    },
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  prettier,
);
