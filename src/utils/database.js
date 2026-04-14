// 数据库管理模块 - 根据环境使用不同的存储方式

// 默认数据结构
const defaultData = {
  // 用户设置
  settings: {
    theme: 'light',
    autoSave: true,
    lastOpenedFile: null
  },
  
}

// 检测运行环境
const isElectron = typeof window !== 'undefined' && window.process && window.process.type && window.require

class Database {
  constructor() {
    this.db = null
    this.init()
  }

  async init() {
    try {
      console.log('开始初始化数据库...')
      if (isElectron) {
        // 尝试初始化文件存储（Electron环境）
        const fileStorageSuccess = await this.initFileStorage()
        
        // 如果文件存储初始化失败，回退到浏览器存储
        if (fileStorageSuccess === false) {
          console.log('文件存储初始化失败，使用浏览器存储')
          await this.initBrowserStorage()
        }
      } else {
        // 浏览器环境：使用LocalStorage
        await this.initBrowserStorage()
      }
      
      // 确保db已正确初始化
      if (!this.db) {
        console.error('数据库实例未初始化，强制使用浏览器存储')
        await this.initBrowserStorage()
        return
      }
      
      // 读取数据，如果数据库为空或不存在，则使用默认数据
      try {
        await this.db.read()
        console.log('数据库读取成功')
      } catch (readError) {
        console.error('数据库读取失败，使用默认数据:', readError)
        // 如果读取失败，直接使用默认数据
        this.db.data = { ...defaultData }
      }
      
      if (!this.db.data) {
        this.db.data = { ...defaultData }
        try {
          await this.db.write()
          console.log('默认数据写入成功')
        } catch (writeError) {
          console.error('默认数据写入失败，继续使用内存中的默认数据:', writeError)
          // 不抛出错误，允许系统继续运行
        }
      }
    } catch (error) {
      console.error('数据库初始化失败，尝试使用浏览器存储:', error)
      // 回退到浏览器存储
      try {
        await this.initBrowserStorage()
      } catch (fallbackError) {
        console.error('浏览器存储初始化也失败:', fallbackError)
        throw error
      }
    }
  }

  async initBrowserStorage() {
    // 浏览器环境使用LocalStorage
    const { LocalStoragePreset } = await import('lowdb/browser')
    this.db = LocalStoragePreset('cdi-rectification-db', defaultData)
    console.log('数据库初始化成功: 使用浏览器本地存储')
  }

  async initFileStorage() {
    // 检查是否在Electron环境中
    if (!window.require) {
      console.error('不在Electron环境中，使用浏览器存储')
      return false
    }
    
    try {
      // 使用window.require来避免webpack打包
      const { Low } = window.require('lowdb')
      const path = window.require('path')
      const fs = window.require('fs')
      
      // 获取app对象 - 使用正确的remote模块引用方式
      let app;
      let userDataPath;
      
      // 尝试多种方式获取app对象和用户数据目录
      try {
        // 方式1: @electron/remote
        if (window.require('@electron/remote')) {
          app = window.require('@electron/remote').app;
        } 
        // 方式2: electron.remote
        else if (window.require('electron').remote) {
          app = window.require('electron').remote.app;
        }
        // 方式3: 直接尝试electron.app (适用于main进程)
        else if (window.require('electron').app) {
          app = window.require('electron').app;
        } else {
          throw new Error('无法找到electron app实例')
        }
        
        // 尝试获取用户数据目录
        try {
          userDataPath = app.getPath('userData')
          console.log('获取用户数据目录成功:', userDataPath)
        } catch (getAppPathError) {
          console.error('获取app.getPath失败:', getAppPathError)
          // 备选路径1: app路径的userData属性
          if (app.userData) {
            userDataPath = app.userData
            console.log('使用app.userData作为备选路径:', userDataPath)
          } else {
            // 备选路径2: 使用当前工作目录
            userDataPath = process.cwd()
            console.log('使用当前工作目录作为备选路径:', userDataPath)
          }
        }
      } catch (appError) {
        console.error('获取app对象失败，使用安全备选路径:', appError)
        // 尝试获取Node.js的环境变量作为备选
        userDataPath = process.env.APPDATA || process.env.HOME || process.cwd()
        console.log('使用环境变量或当前目录作为备选路径:', userDataPath)
      }
      
      // 确保路径存在，创建必要的目录
      try {
        if (!fs.existsSync(userDataPath)) {
          console.log('创建用户数据目录:', userDataPath)
          fs.mkdirSync(userDataPath, { recursive: true, mode: 0o755 })
        }
      } catch (mkdirError) {
        console.error('创建目录失败，尝试更安全的路径:', mkdirError)
        // 使用绝对的英文路径作为最后的安全选择
        userDataPath = path.join(process.env.USERPROFILE || process.cwd(), 'CDI_DATA')
        try {
          fs.mkdirSync(userDataPath, { recursive: true, mode: 0o755 })
          console.log('使用安全路径:', userDataPath)
        } catch (safeMkdirError) {
          console.error('安全路径也无法创建，切换到浏览器存储:', safeMkdirError)
          return false
        }
      }
      
      // 创建数据库文件路径 - 使用英文名称避免中文路径权限问题
      const dbPath = path.join(userDataPath, 'cdi-rectification-db.json')
      console.log('数据库文件路径:', dbPath)
      
      // 尝试测试文件访问权限
      try {
        // 尝试打开文件，测试权限
        const testFd = fs.openSync(dbPath, 'a+')
        fs.closeSync(testFd)
        console.log('文件权限测试通过:', dbPath)
      } catch (permissionError) {
        console.error('文件权限测试失败，切换到浏览器存储:', permissionError)
        return false
      }
      
      // 创建自定义的JSONFile适配器，全面处理权限问题
      const createCustomJSONFileAdapter = (filePath) => {
        // 添加路径合法性检查
        if (!filePath || typeof filePath !== 'string') {
          console.error('无效的数据库文件路径')
          throw new Error('无效的数据库文件路径')
        }
        
        return {
          async read() {
            // 分层错误处理的读取方法
            try {
              // 首先检查文件是否存在且可访问
              if (!fs.existsSync(filePath)) {
                console.log('数据库文件不存在，将创建新文件')
                return null
              }
              
              // 尝试使用不同的标志位打开文件以检查权限
              try {
                // 先用同步方式测试权限
                const fd = fs.openSync(filePath, 'r')
                fs.closeSync(fd)
                console.log('文件可读权限检查通过')
              } catch (accessError) {
                console.warn('文件访问权限检查失败，尝试直接读取:', accessError)
              }
              
              // 尝试多种读取方式
              try {
                // 方式1: 使用异步API
                const data = await fs.promises.readFile(filePath, 'utf8')
                return JSON.parse(data)
              } catch (asyncError) {
                console.warn('异步读取失败，尝试同步读取:', asyncError)
                // 方式2: 使用同步API作为备选
                try {
                  const data = fs.readFileSync(filePath, 'utf8')
                  return JSON.parse(data)
                } catch (syncError) {
                  console.error('同步读取也失败:', syncError)
                  // 文件可能损坏或无法访问，返回null让系统创建新文件
                  return null
                }
              }
            } catch (error) {
              console.error('读取数据库文件失败:', error)
              // 返回null而不是抛出错误，允许系统继续运行
              return null
            }
          },
          
          async write(data) {
            try {
              // 确保数据有效
              if (!data || typeof data !== 'object') {
                throw new Error('无效的数据对象')
              }
              
              const jsonString = JSON.stringify(data, null, 2)
              
              // 策略1: 直接写入，带更多选项
              try {
                // 使用不同的标志位组合
                await fs.promises.writeFile(filePath, jsonString, { 
                  encoding: 'utf8',
                  flag: 'w',  // 截断并写入
                  mode: 0o644  // 设置文件权限
                })
                console.log('直接写入数据库文件成功')
                return
              } catch (directWriteError) {
                console.warn('直接写入失败，尝试备选策略:', directWriteError)
              }
              
              // 策略2: 使用临时文件，但选择不同的位置和方法
              try {
                // 使用不同的临时文件位置，避免与原文件在同一目录
                const tempDir = path.dirname(filePath)
                const tempFileName = `cdi-temp-${Date.now()}.json`
                const tempFilePath = path.join(tempDir, tempFileName)
                
                // 写入临时文件
                await fs.promises.writeFile(tempFilePath, jsonString, { 
                  encoding: 'utf8',
                  mode: 0o644
                })
                console.log('临时文件写入成功:', tempFilePath)
                
                // 尝试不同的文件替换方法
                try {
                  // 先检查目标文件是否存在，存在则尝试删除
                  if (fs.existsSync(filePath)) {
                    try {
                      await fs.promises.unlink(filePath)
                      console.log('原文件已删除')
                    } catch (unlinkError) {
                      console.warn('删除原文件失败，尝试直接覆盖:', unlinkError)
                    }
                  }
                  
                  // 复制临时文件到目标位置
                  await fs.promises.copyFile(tempFilePath, filePath)
                  console.log('通过复制临时文件写入成功')
                } catch (replaceError) {
                  console.warn('文件替换失败，尝试移动文件:', replaceError)
                  // 尝试使用移动操作
                  try {
                    await fs.promises.rename(tempFilePath, filePath)
                    console.log('通过移动临时文件写入成功')
                  } catch (renameError) {
                    console.warn('移动文件也失败:', renameError)
                  }
                } finally {
                  // 尝试清理临时文件，但不影响主要功能
                  try {
                    if (fs.existsSync(tempFilePath)) {
                      await fs.promises.unlink(tempFilePath)
                      console.log('临时文件已清理')
                    }
                  } catch (cleanupError) {
                    console.warn('清理临时文件失败，但不影响主要功能:', cleanupError)
                  }
                }
                return
              } catch (tempFileError) {
                console.warn('临时文件策略失败，尝试同步写入:', tempFileError)
              }
              
              // 策略3: 使用同步写入作为最后手段
              try {
                fs.writeFileSync(filePath, jsonString, { 
                  encoding: 'utf8',
                  flag: 'w',
                  mode: 0o644
                })
                console.log('使用同步写入作为最后手段成功')
                return
              } catch (syncWriteError) {
                console.warn('同步写入也失败:', syncWriteError)
              }
              
              // 策略4: 使用备用文件路径
              try {
                // 使用带时间戳的备用文件名
                const backupFilePath = `${filePath}.${Date.now()}.bak`
                await fs.promises.writeFile(backupFilePath, jsonString, { 
                  encoding: 'utf8',
                  mode: 0o644
                })
                console.log('写入备用文件成功:', backupFilePath)
                // 这里不抛出错误，允许系统继续运行，尽管数据保存在备用位置
                return
              } catch (backupError) {
                console.error('备用文件写入也失败:', backupError)
              }
              
              // 所有策略都失败，抛出错误
                throw new Error('所有文件写入策略都失败')
              } catch (error) {
                console.error('写入数据库文件失败:', error)
                // 不抛出错误，允许系统继续运行
                // throw error
                // 写入失败后，尝试切换到浏览器存储作为最后的备选
                try {
                  console.warn('尝试切换到浏览器存储作为备选')
                  await this.initBrowserStorage()
                } catch (fallbackError) {
                  console.error('浏览器存储也初始化失败:', fallbackError)
                }
              }
            }
          }
        }
        
        // 创建自定义适配器
        try {
          this.adapter = createCustomJSONFileAdapter(dbPath)
          this.db = new Low(this.adapter, { ...defaultData }) // 直接使用默认数据初始化
          console.log('数据库实例创建成功')
          
          // 读取现有数据（可选操作，失败不影响系统运行）
          try {
            await this.db.read()
            console.log('尝试读取现有数据库数据')
          } catch (readError) {
            console.error('读取数据库文件失败，使用默认数据:', readError)
            // 保持默认数据，不抛出错误
          }
          
          // 确保数据对象存在
          if (!this.db.data || typeof this.db.data !== 'object') {
            this.db.data = { ...defaultData }
            console.warn('数据库数据无效，重置为默认数据')
          }
          
          console.log('数据库初始化成功: 使用文件存储', dbPath)
          return true // 表示文件存储初始化成功
        } catch (dbError) {
          console.error('创建数据库实例失败，切换到浏览器存储:', dbError)
          return false
        }
      } catch (error) {
        console.error('文件存储初始化失败:', error)
        // 如果文件存储失败，回退到浏览器存储
        console.log('回退到浏览器存储')
        await this.initBrowserStorage()
        return false
      }
  }

  // 获取整个数据库
  getDatabase() {
    return this.db.data
  }

  // 获取指定表的数据
  getTable(tableName) {
    return this.db.data[tableName] || []
  }

  // 添加数据到指定表
  async add(tableName, data) {
    try {
      const table = this.db.data[tableName] || []
      const newData = {
        id: this.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      table.push(newData)
      this.db.data[tableName] = table
      await this.db.write()
      return newData
    } catch (error) {
      console.error(`添加数据到表 ${tableName} 失败:`, error)
      throw error
    }
  }

  // 更新指定表中的数据
  async update(tableName, id, updates) {
    try {
      const table = this.db.data[tableName] || []
      const index = table.findIndex(item => item.id === id)
      
      if (index === -1) {
        throw new Error(`ID为 ${id} 的数据不存在`)
      }
      
      table[index] = {
        ...table[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      this.db.data[tableName] = table
      await this.db.write()
      return table[index]
    } catch (error) {
      console.error(`更新表 ${tableName} 中ID为 ${id} 的数据失败:`, error)
      throw error
    }
  }

  // 删除指定表中的数据
  async delete(tableName, id) {
    try {
      const table = this.db.data[tableName] || []
      const index = table.findIndex(item => item.id === id)
      
      if (index === -1) {
        throw new Error(`ID为 ${id} 的数据不存在`)
      }
      
      const deletedItem = table.splice(index, 1)[0]
      this.db.data[tableName] = table
      await this.db.write()
      return deletedItem
    } catch (error) {
      console.error(`删除表 ${tableName} 中ID为 ${id} 的数据失败:`, error)
      throw error
    }
  }

  // 查询指定表中的数据
  find(tableName, query = {}) {
    try {
      const table = this.db.data[tableName] || []
      return table.filter(item => {
        return Object.keys(query).every(key => item[key] === query[key])
      })
    } catch (error) {
      console.error(`查询表 ${tableName} 失败:`, error)
      throw error
    }
  }

  // 根据ID查找数据
  findById(tableName, id) {
    try {
      const table = this.db.data[tableName] || []
      return table.find(item => item.id === id)
    } catch (error) {
      console.error(`在表 ${tableName} 中查找ID为 ${id} 的数据失败:`, error)
      throw error
    }
  }

  // 获取设置
  getSettings() {
    return this.getTable('settings')
  }

  // 更新设置
  async updateSettings(updates) {
    try {
      const settings = this.db.data.settings || {}
      this.db.data.settings = {
        ...settings,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await this.db.write()
      return this.db.data.settings
    } catch (error) {
      console.error('更新设置失败:', error)
      throw error
    }
  }

  // 备份数据库
  async backup() {
    try {
      if (isElectron) {
        // Electron环境：保存到文件
        let dialog;
        if (window.require('@electron/remote')) {
          dialog = window.require('@electron/remote').dialog;
        } else if (window.require('electron').remote) {
          dialog = window.require('electron').remote.dialog;
        } else {
          throw new Error('无法找到electron remote模块')
        }
        
        const fs = window.require('fs')
        
        const result = await dialog.showSaveDialog({
          title: '备份数据库',
          defaultPath: 'cdi-rectification-backup.json',
          filters: [
            { name: 'JSON Files', extensions: ['json'] }
          ]
        })
        
        if (!result.canceled && result.filePath) {
          const backupData = JSON.stringify(this.db.data, null, 2)
          fs.writeFileSync(result.filePath, backupData, 'utf8')
          console.log('数据库备份成功:', result.filePath)
          return result.filePath
        }
        return null
      } else {
        // 浏览器环境：下载文件
        const dataStr = JSON.stringify(this.db.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = 'cdi-rectification-backup.json'
        link.click()
        
        console.log('数据库备份文件已开始下载')
        return true
      }
    } catch (error) {
      console.error('数据库备份失败:', error)
      throw error
    }
  }

  // 恢复数据库
  async restore() {
    try {
      if (isElectron) {
        // Electron环境：从文件恢复
        let dialog;
        if (window.require('@electron/remote')) {
          dialog = window.require('@electron/remote').dialog;
        } else if (window.require('electron').remote) {
          dialog = window.require('electron').remote.dialog;
        } else {
          throw new Error('无法找到electron remote模块')
        }
        
        const fs = window.require('fs')
        
        const result = await dialog.showOpenDialog({
          title: '恢复数据库',
          filters: [
            { name: 'JSON Files', extensions: ['json'] }
          ],
          properties: ['openFile']
        })
        
        if (!result.canceled && result.filePaths.length > 0) {
          const filePath = result.filePaths[0]
          const backupData = fs.readFileSync(filePath, 'utf8')
          const parsedData = JSON.parse(backupData)
          
          this.db.data = { ...defaultData, ...parsedData }
          await this.db.write()
          
          console.log('数据库恢复成功:', filePath)
          return filePath
        }
        return null
      } else {
        // 浏览器环境：从上传的文件恢复
        return new Promise((resolve, reject) => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.json'
          
          input.onchange = (e) => {
            const file = e.target.files[0]
            if (!file) {
              resolve(null)
              return
            }
            
            const reader = new FileReader()
            reader.onload = (event) => {
              try {
                const backupData = event.target.result
                const parsedData = JSON.parse(backupData)
                
                this.db.data = { ...defaultData, ...parsedData }
                this.db.write()
                
                console.log('数据库恢复成功')
                resolve(true)
              } catch (error) {
                reject(error)
              }
            }
            reader.readAsText(file)
          }
          
          input.click()
        })
      }
    } catch (error) {
      console.error('数据库恢复失败:', error)
      throw error
    }
  }

  // 清空数据库
  async clear() {
    try {
      this.db.data = { ...defaultData }
      await this.db.write()
      console.log('数据库已清空')
    } catch (error) {
      console.error('清空数据库失败:', error)
      throw error
    }
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  // 向数组字段添加数据
  async addToArray(tableName, id, arrayField, data) {
    try {
      const table = this.db.data[tableName] || []
      const item = table.find(item => item.id === id)
      
      if (!item) {
        throw new Error(`ID为 ${id} 的数据不存在`)
      }
      
      if (!Array.isArray(item[arrayField])) {
        throw new Error(`字段 ${arrayField} 不是数组类型`)
      }
      
      const newData = {
        id: this.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      item[arrayField].push(newData)
      item.updatedAt = new Date().toISOString()
      
      this.db.data[tableName] = table
      await this.db.write()
      
      return newData
    } catch (error) {
      console.error(`向表 ${tableName} 中ID为 ${id} 的 ${arrayField} 数组添加数据失败:`, error)
      throw error
    }
  }
}

// 创建数据库实例
export const db = new Database()

export default db