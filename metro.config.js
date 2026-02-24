const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ESLint, Prettier 등 개발 전용 파일을 번들에서 제외
// 주의: node_modules 내 scripts는 차단하면 안 됨 (react-native-reanimated 필요)
config.resolver.blockList = [
  /eslint\.config\.(js|mjs|cjs)$/,
  /\.eslintrc\./,
  /prettier\.config\./,
];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'lottie-react-native') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'utils/lottie-mock.web.js'),
    };
  }

  // Zustand's ESM middleware uses import.meta.env, which can break Expo web bundles
  // when served as non-module scripts. Force CJS middleware for web builds.
  if (platform === 'web' && moduleName === 'zustand/middleware') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
    };
  }

  if (typeof originalResolveRequest === 'function') {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
