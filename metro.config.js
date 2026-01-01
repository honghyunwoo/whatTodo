const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ESLint, Prettier 등 개발 전용 파일을 번들에서 제외
// 주의: node_modules 내 scripts는 차단하면 안 됨 (react-native-reanimated 필요)
config.resolver.blockList = [
  /eslint\.config\.(js|mjs|cjs)$/,
  /\.eslintrc\./,
  /prettier\.config\./,
];

module.exports = config;
