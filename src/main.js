import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from './api/axios'
import './assets/styles/global.css'

Vue.config.productionTip = false

// 使用Element UI
Vue.use(ElementUI)

// 挂载Axios到Vue原型
Vue.prototype.$axios = axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
