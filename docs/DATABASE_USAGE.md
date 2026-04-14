# LowDB 数据库使用指南

## 概述

本项目使用 [lowdb](https://github.com/typicode/lowdb) 作为本地数据存储解决方案。lowdb 是一个轻量级的本地 JSON 数据库，非常适合 Electron 桌面应用程序的数据存储需求。

## 安装依赖

项目已在 `package.json` 中添加了 lowdb 依赖：

```json
{
  "dependencies": {
    "lowdb": "^7.0.1"
  }
}
```

## 数据库结构

### 默认数据结构

数据库包含以下默认表结构：

```javascript
{
  // 用户设置
  settings: {
    theme: 'light',        // 主题设置
    language: 'zh-CN',     // 语言设置
    autoSave: true,       // 自动保存
    lastOpenedFile: null   // 最后打开的文件
  },
  
  // 整改任务数据
  rectificationTasks: [],
  
  // 巡检数据
  patrolRecords: [],
  
  // 用户数据
  users: [],
  
  // 系统日志
  systemLogs: []
}
```

## 核心 API

### 获取数据库实例

```javascript
import { getDatabase } from '@/utils/database.js'

// 获取默认路径的数据库实例
const db = getDatabase()

// 获取指定路径的数据库实例
const db = getDatabase('/path/to/data')
```

### 基本操作

#### 1. 获取数据

```javascript
// 获取整个数据库
const allData = db.getDatabase()

// 获取指定表的数据
const tasks = db.get('rectificationTasks')
const settings = db.get('settings')
```

#### 2. 添加数据

```javascript
// 向表中添加数据（自动生成ID和时间戳）
const newTask = db.add('rectificationTasks', {
  title: '修复安全漏洞',
  description: '修复系统中发现的安全漏洞',
  priority: 'high',
  status: 'pending'
})
```

#### 3. 更新数据

```javascript
// 根据ID更新数据
const updatedTask = db.update('rectificationTasks', taskId, {
  status: 'completed',
  completedAt: new Date().toISOString()
})
```

#### 4. 删除数据

```javascript
// 根据ID删除数据
const deletedTask = db.delete('rectificationTasks', taskId)
```

#### 5. 查询数据

```javascript
// 根据条件查询
const highPriorityTasks = db.find('rectificationTasks', { priority: 'high' })

// 根据ID查询
const task = db.findById('rectificationTasks', taskId)
```

### 高级功能

#### 1. 数据库备份

```javascript
// 创建备份
const backupPath = db.backup()
console.log('备份路径:', backupPath)
```

#### 2. 数据库恢复

```javascript
// 从备份恢复
const success = db.restore('/path/to/backup.json')
if (success) {
  console.log('数据库恢复成功')
}
```

#### 3. 清空数据库

```javascript
// 清空所有数据（恢复默认结构）
db.clear()
```

## 使用示例

### 1. 设置管理

```javascript
import { getDatabase } from '@/utils/database.js'

class SettingsManager {
  static getSettings() {
    const db = getDatabase()
    return db.get('settings')
  }
  
  static updateTheme(theme) {
    const db = getDatabase()
    const settings = db.get('settings')
    settings.theme = theme
    db.set('settings', settings)
  }
}

// 使用示例
const settings = SettingsManager.getSettings()
SettingsManager.updateTheme('dark')
```

### 2. 任务管理

```javascript
class TaskManager {
  static getAllTasks() {
    const db = getDatabase()
    return db.get('rectificationTasks')
  }
  
  static addTask(taskData) {
    const db = getDatabase()
    return db.add('rectificationTasks', {
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString()
    })
  }
  
  static completeTask(taskId) {
    const db = getDatabase()
    return db.update('rectificationTasks', taskId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    })
  }
}
```

### 3. Vue 组件中使用

```vue
<template>
  <div>
    <input v-model="newTask.title" placeholder="任务标题" />
    <button @click="addTask">添加任务</button>
    
    <div v-for="task in tasks" :key="task.id">
      <h3>{{ task.title }}</h3>
      <button @click="completeTask(task.id)">完成</button>
    </div>
  </div>
</template>

<script>
import { getDatabase } from '@/utils/database.js'

export default {
  data() {
    return {
      db: null,
      newTask: { title: '' },
      tasks: []
    }
  },
  mounted() {
    this.db = getDatabase()
    this.loadTasks()
  },
  methods: {
    loadTasks() {
      this.tasks = this.db.get('rectificationTasks')
    },
    
    addTask() {
      if (this.newTask.title.trim()) {
        this.db.add('rectificationTasks', this.newTask)
        this.newTask = { title: '' }
        this.loadTasks()
      }
    },
    
    completeTask(taskId) {
      this.db.update('rectificationTasks', taskId, { status: 'completed' })
      this.loadTasks()
    }
  }
}
</script>
```

## 数据文件位置

- **开发环境**: `项目根目录/data/database.json`
- **生产环境**: Electron 的用户数据目录

## 最佳实践

### 1. 错误处理

```javascript
try {
  const db = getDatabase()
  const data = db.get('someTable')
} catch (error) {
  console.error('数据库操作失败:', error)
  // 处理错误
}
```

### 2. 数据验证

```javascript
function validateTaskData(taskData) {
  if (!taskData.title || !taskData.title.trim()) {
    throw new Error('任务标题不能为空')
  }
  // 更多验证...
}

const validTask = validateTaskData(taskData)
const newTask = db.add('rectificationTasks', validTask)
```

### 3. 性能优化

- 避免频繁的数据库写入操作
- 批量操作时使用事务
- 定期清理不需要的日志数据

### 4. 数据备份策略

```javascript
// 定期备份
setInterval(() => {
  const db = getDatabase()
  db.backup()
}, 24 * 60 * 60 * 1000) // 每天备份一次
```

## 故障排除

### 常见问题

1. **数据库文件损坏**
   - 删除损坏的数据库文件，系统会自动重新创建
   - 使用备份文件进行恢复

2. **权限问题**
   - 确保应用程序有读写数据目录的权限
   - 检查文件路径是否正确

3. **数据丢失**
   - 检查是否有定期备份
   - 验证数据操作逻辑是否正确

### 调试技巧

```javascript
// 启用详细日志
const db = getDatabase()
console.log('数据库路径:', db.dataPath)
console.log('当前数据:', db.getDatabase())
```

## 扩展功能

可以根据项目需求扩展数据库功能：

- 添加数据加密
- 实现数据同步
- 添加数据迁移工具
- 实现数据导入导出

## 相关文件

- `src/utils/database.js` - 核心数据库模块
- `src/utils/database.example.js` - 使用示例
- `src/components/DatabaseExample.vue` - Vue 组件示例

## 技术支持

如遇到问题，请参考：
- [lowdb 官方文档](https://github.com/typicode/lowdb)
- 项目中的示例代码
- 本使用指南