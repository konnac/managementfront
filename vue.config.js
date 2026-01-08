const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: '部门级管理系统'
    }
  },
  devServer: {
    port: 7000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端API地址
        changeOrigin: true, // 是否跨域
        pathRewrite: {
          '^/api': '' // 重写路径，去掉/api前缀
        }
      }
    }
  }
})
