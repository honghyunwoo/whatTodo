const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Node.js 모듈 폴리필 설정
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
  };

  // app 디렉토리 및 nanoid alias 추가
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname),
    'nanoid/non-secure': path.resolve(__dirname, 'patches/nanoid-shim.js'),
    'nanoid': path.resolve(__dirname, 'patches/nanoid-shim.js'),
  };

  // ESLint 관련 파일 제외
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  });

  return config;
};
