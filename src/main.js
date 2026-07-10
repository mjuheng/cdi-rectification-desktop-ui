import Vue from 'vue'
import App from './app.vue'
import router from './router'
import TDesign from 'tdesign-vue';
import ModulerHeader from './views/RectifyImplement/Components/ModulerHeader.vue'
import "@/styles/index.less"; // global css
import db from './utils/database.js'

// 引入组件库的少量全局样式变量
import 'tdesign-vue/es/style/index.css';

Vue.config.productionTip = false
Vue.use(TDesign);

// 全局注册ModulerHeader组件
Vue.component('ModulerHeader', ModulerHeader);

// 初始化数据库并设置为全局变量
async function initializeApp() {
  try {
    // 初始化数据库
    await db.init()
    
    // 将数据库实例设置为全局变量，方便所有组件使用
    Vue.prototype.$db = db
    // 创建Vue实例
    new Vue({
      router,
      render: h => h(App)
    }).$mount('#app')
    
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 启动应用
initializeApp()

// 全局环境变量配置对象
window.APP_CONFIG = {
  env: process.env.VUE_APP_ENV || 'development',
  apiBaseUrl: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
  debug: process.env.VUE_APP_DEBUG === 'true',
  // isProvince: process.env.VUE_APP_IS_PROVINCE === 'true',
  isProvince: true,//是否是省 false
}

// 开发环境下打印环境信息
if (process.env.NODE_ENV === 'development') {
  console.log('应用环境:', window.APP_CONFIG.env)
  console.log('API基础URL:', window.APP_CONFIG.apiBaseUrl)
  console.log('调试模式:', window.APP_CONFIG.debug)
}

// 忽略 ResizeObserver 循环警告
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && 
      args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
    return; // 忽略这个特定的警告
  }
  originalError.apply(console, args);
};