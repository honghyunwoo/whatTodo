const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Node.js 모듈 폴리필 설정
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
  };

  // app 디렉토리 및 웹 호환성 alias 추가
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname),
    'nanoid/non-secure': path.resolve(__dirname, 'patches/nanoid-shim.js'),
    'nanoid': path.resolve(__dirname, 'patches/nanoid-shim.js'),
    'expo-notifications': path.resolve(__dirname, 'patches/expo-notifications-shim.ts'),
  };

  // ESLint 관련 파일 제외
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  });

  // Configure dev server for Replit environment - use port 5000 for web
  config.devServer = {
    ...config.devServer,
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: 'all',
    client: {
      webSocketURL: {
        hostname: '0.0.0.0',
        port: 0,
        pathname: '/ws',
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };

  return config;
};
