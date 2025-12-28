const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ESLint, Prettier 등 개발 전용 파일을 웹 번들에서 제외
config.resolver.blockList = [
  /eslint\.config\.mjs$/,
  /\.eslintrc\./,
  /prettier\.config\./,
  /scripts\/.*/, // scripts 폴더 제외 (import.meta 사용)
];

// Web support: resolve .web.js extensions first
config.resolver.sourceExts = ['web.js', 'web.jsx', 'web.ts', 'web.tsx', ...config.resolver.sourceExts];

// Override lottie-react-native on web to avoid import.meta error
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, redirect lottie-react-native to our empty mock
  if (platform === 'web' && moduleName === 'lottie-react-native') {
    return {
      filePath: path.resolve(__dirname, 'utils/lottie-mock.web.js'),
      type: 'sourceFile',
    };
  }

  // Use default resolver for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
