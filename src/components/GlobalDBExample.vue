<template>
  <div class="global-db-example">
    <h2>全局数据库使用示例</h2>
    
    <!-- 设置管理 -->
    <div class="section">
      <h3>设置管理</h3>
      <div class="settings">
        <div class="setting-item">
          <label>主题:</label>
          <select v-model="currentTheme" @change="updateTheme">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
        <div class="setting-item">
          <label>自动保存:</label>
          <input type="checkbox" v-model="autoSave" @change="updateAutoSave" />
        </div>
      </div>
    </div>

    <!-- 任务管理 -->
    <div class="section">
      <h3>整改任务管理</h3>
      <div class="task-form">
        <t-input v-model="newTask.title" placeholder="任务标题" />
        <t-input v-model="newTask.description" placeholder="任务描述" />
        <t-select v-model="newTask.priority" placeholder="选择优先级">
          <t-option value="low" label="低" />
          <t-option value="medium" label="中" />
          <t-option value="high" label="高" />
        </t-select>
        <t-button @click="addTask">添加任务</t-button>
      </div>
      
      <div class="task-list">
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <h4>{{ task.title }}</h4>
          <p>{{ task.description }}</p>
          <span class="priority" :class="task.priority">优先级: {{ task.priority }}</span>
          <span class="status">状态: {{ task.status }}</span>
          <t-button size="small" @click="completeTask(task.id)" v-if="task.status === 'pending'">完成</t-button>
          <t-button size="small" theme="danger" @click="deleteTask(task.id)">删除</t-button>
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
        <div class="stat-item">
          <span class="stat-label">已完成任务:</span>
          <span class="stat-value">{{ completedTasks.length }}</span>
        </div>
      </div>
    </div>

    <!-- 数据库操作 -->
    <div class="section">
      <h3>数据库操作</h3>
      <div class="db-actions">
        <t-button @click="backupDatabase">备份数据库</t-button>
        <t-button @click="clearDatabase" theme="danger">清空数据库</t-button>
      </div>
    </div>
  </div>
</template>

<script>
import { MessagePlugin } from 'tdesign-vue'

export default {
  name: 'GlobalDBExample',
  data() {
    return {
      currentTheme: 'light',
      autoSave: true,
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
    },
    completedTasks() {
      return this.tasks.filter(task => task.status === 'completed')
    }
  },
  async mounted() {
    await this.loadData()
    this.applyTheme()
  },
  methods: {
    // 加载数据
    async loadData() {
      try {
        // 使用全局数据库实例
        const settings = window.$db.getTable('settings')
        this.currentTheme = settings.theme || 'light'
        this.autoSave = settings.autoSave !== false // 默认为true
        
        this.tasks = window.$db.getTable('rectificationTasks')
        
        console.log('数据加载成功')
      } catch (error) {
        console.error('数据加载失败:', error)
        MessagePlugin.error('数据加载失败')
      }
    },
    
    // 更新主题
    async updateTheme() {
      try {
        await window.$db.updateSettings({ theme: this.currentTheme })
        this.applyTheme()
        MessagePlugin.success('主题更新成功')
      } catch (error) {
        console.error('主题更新失败:', error)
        MessagePlugin.error('主题更新失败')
      }
    },
    
    // 更新自动保存设置
    async updateAutoSave() {
      try {
        await window.$db.updateSettings({ autoSave: this.autoSave })
        MessagePlugin.success('设置更新成功')
      } catch (error) {
        console.error('设置更新失败:', error)
        MessagePlugin.error('设置更新失败')
      }
    },
    
    // 应用主题
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.currentTheme)
    },
    
    // 添加任务
    async addTask() {
      if (!this.newTask.title.trim()) {
        MessagePlugin.warning('请输入任务标题')
        return
      }
      
      try {
        await window.$db.add('rectificationTasks', {
          title: this.newTask.title,
          description: this.newTask.description,
          priority: this.newTask.priority,
          status: 'pending'
        })
        
        // 重新加载数据
        await this.loadData()
        
        // 重置表单
        this.newTask = {
          title: '',
          description: '',
          priority: 'medium'
        }
        
        MessagePlugin.success('任务添加成功')
      } catch (error) {
        console.error('任务添加失败:', error)
        MessagePlugin.error('任务添加失败')
      }
    },
    
    // 完成任务
    async completeTask(taskId) {
      try {
        await window.$db.update('rectificationTasks', taskId, {
          status: 'completed',
          completedAt: new Date().toISOString()
        })
        
        await this.loadData()
        MessagePlugin.success('任务已完成')
      } catch (error) {
        console.error('任务完成失败:', error)
        MessagePlugin.error('任务完成失败')
      }
    },
    
    // 删除任务
    async deleteTask(taskId) {
      try {
        await window.$db.delete('rectificationTasks', taskId)
        await this.loadData()
        MessagePlugin.success('任务删除成功')
      } catch (error) {
        console.error('任务删除失败:', error)
        MessagePlugin.error('任务删除失败')
      }
    },
    
    // 备份数据库
    async backupDatabase() {
      try {
        const result = await window.$db.backup()
        if (result) {
          MessagePlugin.success('数据库备份成功')
        }
      } catch (error) {
        console.error('数据库备份失败:', error)
        MessagePlugin.error('数据库备份失败')
      }
    },
    
    // 清空数据库
    async clearDatabase() {
      try {
        const confirmed = await MessagePlugin.confirm('确定要清空数据库吗？此操作不可恢复！')
        if (confirmed) {
          await window.$db.clear()
          await this.loadData()
          MessagePlugin.success('数据库已清空')
        }
      } catch (error) {
        console.error('清空数据库失败:', error)
        MessagePlugin.error('清空数据库失败')
      }
    }
  }
}
</script>

<style scoped>
.global-db-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
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
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 10px;
  margin-bottom: 20px;
}

.task-list {
  display: grid;
  gap: 15px;
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
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
}

.priority.high {
  background: #ffebee;
  color: #d32f2f;
}

.priority.medium {
  background: #fff3e0;
  color: #f57c00;
}

.priority.low {
  background: #e8f5e8;
  color: #388e3c;
}

.status {
  color: #666;
  font-size: 14px;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
  min-width: 100px;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.db-actions {
  display: flex;
  gap: 10px;
}

[data-theme="dark"] .section {
  border-color: #444;
  background: #2d2d2d;
}

[data-theme="dark"] .task-item {
  border-color: #444;
  background: #3d3d3d;
}

[data-theme="dark"] .stat-item {
  background: #3d3d3d;
}
</style>