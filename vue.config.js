module.exports = {
    publicPath: '/',
    productionSourceMap: false,
    configureWebpack: {
      output: {
        filename: '[name].[hash].js'
      }
    }
  };