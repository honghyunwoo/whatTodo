const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ESLint, Prettier 등 개발 전용 파일을 웹 번들에서 제외
config.resolver.blockList = [
  /eslint\.config\.mjs$/,
  /\.eslintrc\./,
  /prettier\.config\./,
  /scripts\/.*/, // scripts 폴더 제외 (import.meta 사용)
];

// Web support: resolve .web.js extensions
config.resolver.sourceExts = ['web.js', 'web.jsx', 'web.ts', 'web.tsx', ...config.resolver.sourceExts];

module.exports = config;
