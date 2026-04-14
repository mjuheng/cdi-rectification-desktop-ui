const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  devServer: {
    port: 8080,
    open: true
  },
  lintOnSave: false,
  // 配置webpack以解决HTML文件冲突
  configureWebpack: {
    optimization: {
      splitChunks: false
    },
    // 配置webpack以支持Node.js模块
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify"),
        "fs": false
      }
    }
  },
  // 禁用默认的HTML生成，使用自定义配置
  chainWebpack: config => {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    
    // 确保只有一个HTML插件实例
    if (process.env.NODE_ENV === 'production') {
      config.plugin('html').tap(args => {
        args[0].minify = {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          collapseBooleanAttributes: true,
          removeScriptTypeAttributes: true
        }
        return args
      })
    }
  }
})