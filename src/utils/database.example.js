// 数据库使用示例 - 适配浏览器本地存储
import db from './database.js'

// 示例1: 用户设置管理
class SettingsManager {
  // 获取设置
  static getSettings() {
    return db.get('settings')
  }
  
  // 更新设置
  static updateSettings(newSettings) {
    const currentSettings = db.get('settings')
    const updatedSettings = { ...currentSettings, ...newSettings }
    db.set('settings', updatedSettings)
    return updatedSettings
  }
  
  // 获取特定设置项
  static getSetting(key) {
    const settings = db.get('settings')
    return settings[key]
  }
}

// 示例2: 整改任务管理
class TaskManager {
  // 获取所有任务
  static getAllTasks() {
    return db.get('rectificationTasks')
  }
  
  // 添加新任务
  static addTask(taskData) {
    return db.add('rectificationTasks', {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      status: 'pending',
      assignee: taskData.assignee,
      deadline: taskData.deadline,
      ...taskData
    })
  }
  
  // 更新任务状态
  static updateTaskStatus(taskId, status) {
    return db.update('rectificationTasks', taskId, { status })
  }
  
  // 删除任务
  static deleteTask(taskId) {
    return db.delete('rectificationTasks', taskId)
  }
  
  // 根据状态筛选任务
  static getTasksByStatus(status) {
    return db.find('rectificationTasks', { status })
  }
}

// 示例3: 巡检记录管理
class PatrolManager {
  // 获取所有巡检记录
  static getAllRecords() {
    return db.get('patrolRecords')
  }
  
  // 添加巡检记录
  static addRecord(recordData) {
    return db.add('patrolRecords', {
      location: recordData.location,
      inspector: recordData.inspector,
      findings: recordData.findings || [],
      status: 'completed',
      timestamp: new Date().toISOString(),
      ...recordData
    })
  }
  
  // 根据巡检员筛选记录
  static getRecordsByInspector(inspector) {
    return db.find('patrolRecords', { inspector })
  }
}

// 示例4: 用户管理
class UserManager {
  // 获取所有用户
  static getAllUsers() {
    return db.get('users')
  }
  
  // 添加用户
  static addUser(userData) {
    return db.add('users', {
      username: userData.username,
      email: userData.email,
      role: userData.role || 'user',
      isActive: true,
      ...userData
    })
  }
  
  // 根据用户名查找用户
  static findUserByUsername(username) {
    const users = db.find('users', { username })
    return users.length > 0 ? users[0] : null
  }
}

// 示例5: 系统日志
class Logger {
  // 添加日志
  static log(level, message, details = {}) {
    return db.add('systemLogs', {
      level, // 'info', 'warn', 'error'
      message,
      details,
      timestamp: new Date().toISOString()
    })
  }
  
  // 获取最近日志
  static getRecentLogs(limit = 100) {
    const logs = db.get('systemLogs')
    return logs.slice(-limit)
  }
  
  // 根据级别筛选日志
  static getLogsByLevel(level) {
    return db.find('systemLogs', { level })
  }
}

// 使用示例
export function demonstrateDatabaseUsage() {
  console.log('=== 数据库使用示例 ===')
  
  // 1. 设置管理
  console.log('1. 设置管理:')
  const settings = SettingsManager.getSettings()
  console.log('当前设置:', settings)
  
  // 更新主题设置
  SettingsManager.updateSettings({ theme: 'dark' })
  console.log('更新后的主题:', SettingsManager.getSetting('theme'))
  
  // 2. 任务管理
  console.log('\n2. 任务管理:')
  
  // 添加任务
  const newTask = TaskManager.addTask({
    title: '修复安全漏洞',
    description: '修复系统中发现的安全漏洞',
    priority: 'high',
    assignee: '张三',
    deadline: '2024-12-31'
  })
  console.log('新任务:', newTask)
  
  // 获取所有任务
  const allTasks = TaskManager.getAllTasks()
  console.log('所有任务:', allTasks)
  
  // 3. 巡检管理
  console.log('\n3. 巡检管理:')
  
  const newRecord = PatrolManager.addRecord({
    location: 'A区机房',
    inspector: '李四',
    findings: ['设备运行正常', '温度适宜']
  })
  console.log('新巡检记录:', newRecord)
  
  // 4. 用户管理
  console.log('\n4. 用户管理:')
  
  const newUser = UserManager.addUser({
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  })
  console.log('新用户:', newUser)
  
  // 5. 日志记录
  console.log('\n5. 日志记录:')
  Logger.log('info', '系统启动', { version: '1.0.0' })
  console.log('日志已记录')
  
  console.log('\n=== 示例完成 ===')
}

// 导出所有管理器
export {
  SettingsManager,
  TaskManager,
  PatrolManager,
  UserManager,
  Logger
}