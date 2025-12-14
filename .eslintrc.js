module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error',
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'build/'],
};
