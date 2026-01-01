const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  // Expo flat config (includes TypeScript, React, React Native rules)
  ...expoConfig,

  // Prettier config (disables conflicting rules)
  prettierConfig,

  // Custom rules
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },

  // Node.js config files (webpack, metro, etc.)
  {
    files: ['*.config.js', '*.config.mjs', '*.config.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'build/',
      'android/',
      'ios/',
    ],
  },
];
