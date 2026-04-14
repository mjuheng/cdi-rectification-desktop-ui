# 全局数据库使用指南

## 概述

项目现在支持全局使用数据库，所有组件都可以直接访问数据库实例，无需重复导入数据库模块。

## 全局数据库实例

数据库实例已设置为全局变量，可以通过以下方式访问：

```javascript
// 在任何Vue组件中直接使用
const db = window.$db
```

## 基本使用方法

### 1. 获取数据

```javascript
// 获取整个数据库
const allData = window.$db.getDatabase()

// 获取指定表的数据
const tasks = window.$db.getTable('rectificationTasks')
const settings = window.$db.getTable('settings')
```

### 2. 添加数据

```javascript
// 添加新任务
const newTask = await window.$db.add('rectificationTasks', {
  title: '修复安全漏洞',
  description: '修复系统中发现的安全漏洞',
  priority: 'high',
  status: 'pending'
})
```

### 3. 更新数据

```javascript
// 更新任务状态
const updatedTask = await window.$db.update('rectificationTasks', taskId, {
  status: 'completed',
  completedAt: new Date().toISOString()
})
```

### 4. 删除数据

```javascript
// 删除任务
const deletedTask = await window.$db.delete('rectificationTasks', taskId)
```

### 5. 查询数据

```javascript
// 根据条件查询
const highPriorityTasks = window.$db.find('rectificationTasks', { priority: 'high' })

// 根据ID查询
const task = window.$db.findById('rectificationTasks', taskId)
```

## Vue组件中使用示例

### 在Vue组件中直接使用

```vue
<template>
  <div>
    <h3>任务列表</h3>
    <div v-for="task in tasks" :key="task.id">
      <h4>{{ task.title }}</h4>
      <p>{{ task.description }}</p>
      <button @click="completeTask(task.id)">完成</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: []
    }
  },
  async mounted() {
    // 直接使用全局数据库实例
    this.tasks = window.$db.getTable('rectificationTasks')
  },
  methods: {
    async completeTask(taskId) {
      await window.$db.update('rectificationTasks', taskId, {
        status: 'completed'
      })
      // 重新加载数据
      this.tasks = window.$db.getTable('rectificationTasks')
    }
  }
}
</script>
```

### 设置管理示例

```vue
<template>
  <div>
    <h3>系统设置</h3>
    <select v-model="theme" @change="updateTheme">
      <option value="light">浅色主题</option>
      <option value="dark">深色主题</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      theme: 'light'
    }
  },
  mounted() {
    // 加载当前设置
    const settings = window.$db.getTable('settings')
    this.theme = settings.theme || 'light'
  },
  methods: {
    async updateTheme() {
      await window.$db.updateSettings({ theme: this.theme })
    }
  }
}
</script>
```

## 高级功能

### 数据库备份

```javascript
// 备份数据库
const backupPath = await window.$db.backup()
console.log('备份路径:', backupPath)
```

### 数据库恢复

```javascript
// 从备份恢复
const success = await window.$db.restore()
if (success) {
  console.log('数据库恢复成功')
}
```

### 清空数据库

```javascript
// 清空所有数据
await window.$db.clear()
```

## 错误处理

建议在使用数据库时添加错误处理：

```javascript
try {
  const tasks = window.$db.getTable('rectificationTasks')
} catch (error) {
  console.error('获取任务数据失败:', error)
  // 处理错误
}
```

## 注意事项

1. **数据库初始化**：数据库在应用启动时自动初始化，无需手动调用
2. **异步操作**：添加、更新、删除等操作是异步的，需要使用await或Promise
3. **数据一致性**：修改数据后记得重新加载相关数据以保持界面同步
4. **错误处理**：建议对数据库操作进行错误处理

## 优势

- **简化导入**：无需在每个组件中导入数据库模块
- **全局访问**：所有组件都可以直接访问数据库实例
- **统一管理**：数据库实例在应用启动时统一初始化
- **易于维护**：数据库使用方式统一，便于维护和调试