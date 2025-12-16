const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
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
