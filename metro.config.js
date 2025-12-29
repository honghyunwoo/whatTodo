const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ESLint, Prettier 등 개발 전용 파일을 번들에서 제외
config.resolver.blockList = [
  /eslint\.config\.(js|mjs|cjs)$/,
  /\.eslintrc\./,
  /prettier\.config\./,
  /scripts\/.*/,
];

module.exports = config;
