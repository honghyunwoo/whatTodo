const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('expo', 'prettier'),
  {
    rules: {
      'no-console': 'warn',
      'prefer-const': 'error',
    },
    ignores: ['node_modules/', '.expo/', 'dist/', 'build/'],
  },
];
