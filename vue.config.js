const webpack = require("webpack");

module.exports = {
  devServer: {
    host: 'localhost',
    hot: true,
    disableHostCheck: true,
    https: false
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "@/assets/scss/_variables.scss";
        `
      }
    }
  },
  configureWebpack: {
    plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      'window.jQuery': 'jquery'
     })
    ],
    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 30000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/, // this is what you are looking for
            priority: -10
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    }
  }
};
