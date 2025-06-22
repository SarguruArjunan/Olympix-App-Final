const path = require('path');

module.exports = {
  // Webpack optimization for images
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset',
        generator: {
          filename: 'static/media/[name].[contenthash:8][ext]'
        },
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb - inline small images as data URLs
          }
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        images: {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          name: 'images',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  // Configure cache for better performance
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};