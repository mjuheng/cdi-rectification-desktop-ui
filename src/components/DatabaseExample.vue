<template>
  <div class="database-example">
    <h2>LowDB 数据库使用示例</h2>
    
    <!-- 设置管理 -->
    <div class="section">
      <h3>设置管理</h3>
      <h3 @click="back">返回</h3>
      <div class="settings">
        <div class="setting-item">
          <label>主题:</label>
          <select v-model="currentTheme" @change="updateTheme">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>

      </div>
    </div>

    <!-- 任务管理 -->
    <div class="section">
      <h3>整改任务管理</h3>
      <div class="task-form">
        <input v-model="newTask.title" placeholder="任务标题" />
        <input v-model="newTask.description" placeholder="任务描述" />
        <select v-model="newTask.priority">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
        <button @click="addTask">添加任务</button>
      </div>
      
      <div class="task-list">
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <h4>{{ task.title }}</h4>
          <p>{{ task.description }}</p>
          <span class="priority" :class="task.priority">优先级: {{ task.priority }}</span>
          <span class="status">状态: {{ task.status }}</span>
          <button @click="deleteTask(task.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="section">
      <h3>数据统计</h3>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">任务总数:</span>
          <span class="stat-value">{{ tasks.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">高优先级任务:</span>
          <span class="stat-value">{{ highPriorityTasks.length }}</span>
        </div>
      </div>
    </div>

    <!-- 数据库操作 -->
    <div class="section">
      <h3>数据库操作</h3>
      <div class="db-actions">
        <button @click="backupDatabase">备份数据库</button>
        <button @click="clearDatabase" class="danger">清空数据库</button>
      </div>
    </div>
  </div>
</template>

<script>
import db from '../utils/database.js'

export default {
  name: 'DatabaseExample',
  data() {
    return {
      db: null,
      currentTheme: 'light',
      newTask: {
        title: '',
        description: '',
        priority: 'medium'
      },
      tasks: []
    }
  },
  computed: {
    highPriorityTasks() {
      return this.tasks.filter(task => task.priority === 'high')
    }
  },
  async mounted() {
    await this.initDatabase()
    this.loadData()
    this.applyTheme()
  },
  methods: {
    async initDatabase() {
      this.db = db
      await this.db.init()
      console.log('数据库初始化完成')
    },
    
    loadData() {
      // 加载设置
      const settings = this.db.getSettings()
      this.currentTheme = settings.theme || 'light'
      
      // 加载任务
      this.tasks = this.db.getTable('rectificationTasks')
    },
    
    async updateTheme() {
      const settings = this.db.getSettings()
      const updatedSettings = { ...settings, theme: this.currentTheme }
      await this.db.updateSettings(updatedSettings)
      this.applyTheme()
    },
    

    
    applyTheme() {
      // 在实际应用中，这里可以应用主题样式
      document.documentElement.setAttribute('data-theme', this.currentTheme)
    },
    
    async addTask() {
      if (!this.newTask.title.trim()) {
        alert('请输入任务标题')
        return
      }
      
      const task = await this.db.add('rectificationTasks', {
        title: this.newTask.title,
        description: this.newTask.description,
        priority: this.newTask.priority,
        status: 'pending'
      })
      
      // 重新从数据库加载任务列表，确保数据一致性
      this.tasks = this.db.getTable('rectificationTasks')
      
      // 重置表单
      this.newTask = {
        title: '',
        description: '',
        priority: 'medium'
      }
      
      console.log('任务添加成功:', task)
    },
    
    async deleteTask(taskId) {
      if (confirm('确定要删除这个任务吗？')) {
        const deletedTask = await this.db.delete('rectificationTasks', taskId)
        if (deletedTask) {
          // 重新从数据库加载任务列表，确保数据一致性
          this.tasks = this.db.getTable('rectificationTasks')
          console.log('任务删除成功:', deletedTask)
        }
      }
    },
    
    async backupDatabase() {
      const result = await this.db.backup()
      if (result) {
        alert('数据库备份成功')
      } else {
        alert('数据库备份取消')
      }
      console.log('数据库备份:', result)
    },
    
    async clearDatabase() {
      if (confirm('确定要清空数据库吗？此操作不可恢复！')) {
        await this.db.clear()
        this.loadData()
        alert('数据库已清空')
      }
    },
    back() {
      this.$router.push("/patrol");
    }
  }
}
</script>

<style scoped>
.database-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.settings {
  display: flex;
  gap: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.task-form input,
.task-form select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.task-form button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.task-list {
  display: grid;
  gap: 10px;
}

.task-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #f9f9f9;
}

.task-item h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.task-item p {
  margin: 0 0 10px 0;
  color: #666;
}

.priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
}

.priority.high {
  background: #ff6b6b;
  color: white;
}

.priority.medium {
  background: #ffd93d;
  color: #333;
}

.priority.low {
  background: #6bcf7f;
  color: white;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.db-actions {
  display: flex;
  gap: 10px;
}

.db-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.db-actions button.danger {
  background: #dc3545;
  color: white;
}

.db-actions button:not(.danger) {
  background: #28a745;
  color: white;
}
</style>