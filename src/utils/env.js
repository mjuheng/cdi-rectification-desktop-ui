// 环境变量管理工具

/**
 * 获取应用配置
 * @returns {Object} 应用配置对象
 */
export function getAppConfig() {
  return window.APP_CONFIG || {
    env: process.env.VUE_APP_ENV || 'development',
    apiBaseUrl: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
    debug: process.env.VUE_APP_DEBUG === 'true'
  }
}

/**
 * 获取API基础URL
 * @returns {string} API基础URL
 */
export function getApiBaseUrl() {
  return getAppConfig().apiBaseUrl
}

/**
 * 判断是否为开发环境
 * @returns {boolean} 是否为开发环境
 */
export function isDevelopment() {
  return getAppConfig().env === 'development'
}

/**
 * 判断是否为生产环境
 * @returns {boolean} 是否为生产环境
 */
export function isProduction() {
  return getAppConfig().env === 'production'
}

/**
 * 判断是否开启调试模式
 * @returns {boolean} 是否开启调试模式
 */
export function isDebug() {
  return getAppConfig().debug
}

/**
 * 调试日志（仅在调试模式下输出）
 * @param {...any} args 日志参数
 */
export function debug(...args) {
  if (isDebug()) {
    console.log('[DEBUG]', ...args)
  }
}

/**
 * 错误日志（始终输出）
 * @param {...any} args 日志参数
 */
export function error(...args) {
  console.error('[ERROR]', ...args)
}