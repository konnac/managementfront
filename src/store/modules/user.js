import { login } from '../../api/login'

export default {
  namespaced: true,
  state: {
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    token: localStorage.getItem('token') || ''
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      console.log('Store: SET_USER_INFO 被调用', userInfo)
      state.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      console.log('Store: userInfo 已保存到 localStorage')
    },
    SET_TOKEN(state, token) {
      console.log('Store: SET_TOKEN 被调用', token)
      state.token = token
      localStorage.setItem('token', token)
      console.log('Store: token 已保存到 localStorage')
    },
    CLEAR_USER_INFO(state) {
      console.log('Store: CLEAR_USER_INFO 被调用')
      state.userInfo = null
      state.token = ''
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      console.log('Store: 用户信息已清除')
    }
  },
  actions: {
    // 登录
    async login({ commit }, userInfo) {
      const response = await login(userInfo)
      const token = response.data
      commit('SET_TOKEN', token)
      return response
    },
    // 退出登录
    logout({ commit }) {
      commit('CLEAR_USER_INFO')
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    username: state => state.userInfo?.username || '',
    userId: state => state.userInfo?.id || null,
    role: state => state.userInfo?.role || '',
    userInfo: state => state.userInfo
  }
}