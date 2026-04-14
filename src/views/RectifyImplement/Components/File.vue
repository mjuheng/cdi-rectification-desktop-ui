<template>
  <div class="components-wrapper">
    <div class="components-item" v-for="(file, index) in internalValue" :key="`file-${index}`">
      <t-radio-group v-model="file.fileType" @change="handleInputChange">
        <t-radio value="公开">公开</t-radio>
        <t-radio value="内部">内部</t-radio>
        <t-radio value="机密">机密</t-radio>
        <t-radio value="秘密">秘密</t-radio>
      </t-radio-group>
      <div class="file-upload-container">
        <t-input placeholder="请输入附件名称" v-model="file.fileName" @change="handleInputChange" readonly
          class="file-name-input"></t-input>
        <div class="upload-btn-wrapper">
          <input type="file" :ref="`fileInput-${index}`" @change="handleFileSelect($event, index)"
            class="file-input" />
          <button class="upload-btn" @click="handleOpenFileInput(index)">选择文件</button>
        </div>
      </div>
      <div class="item-right">
        <CloseCircleIcon color="#e37318" name="t-close-circle" size="24px" class="item-close-btn"
          @click="handleDeletePerson(index)"></CloseCircleIcon>
      </div>
    </div>
    <div class="line-btn" v-if="!unuseAddBtn">
      <div class="add-btn" @click="handleAddPerson">添加文件</div>
    </div>
  </div>
</template>

<script>
import { CloseCircleIcon } from "tdesign-icons-vue";

export default {
  name: "FileComponent",
  components: {
    CloseCircleIcon
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    unuseAddBtn: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // 简化环境检测逻辑
    const isElectron = typeof window !== 'undefined' && 
                     typeof window.process === 'object' &&
                     window.process.versions && 
                     window.process.versions.electron;

    // 统一附件目录路径设置
    let attachmentDir = './attachments'; // 默认路径
    console.log(isElectron,'isElectron');
    if (isElectron) {
      try {
        // 使用与Login.vue相同的方式获取electron.app
        let app;
        if (typeof window.require === 'function') {
          // 优先尝试@electron/remote模块
          if (window.require('@electron/remote')) {
            app = window.require('@electron/remote').app;
            console.log('通过@electron/remote获取app成功:', !!app);
          } else if (window.require('electron').remote) {
            // 降级到electron.remote
            app = window.require('electron').remote.app;
            console.log('通过electron.remote获取app成功:', !!app);
          } else {
            // 最后尝试直接electron模块
            const electron = window.require('electron');
            app = electron.app;
            console.log('通过electron模块获取app:', !!app);
          }
        }
        
        if (app) {
          console.log('app可用');
          let userDataPath = app.getPath('userData');
          console.log('应用路径:', userDataPath);
          
          // 生产环境路径处理逻辑（与Login.vue保持一致）
          if (userDataPath.endsWith("app.asar")) {
            // 先获取resources目录，再获取安装根目录
            const path = window.require('path');
            const resourcesPath = path.dirname(userDataPath);
            userDataPath = path.dirname(resourcesPath);
            console.log('处理后的应用路径:', userDataPath);
          }
          
          const path = window.require('path');
          attachmentDir = path.join(userDataPath, "attachments");
          console.log('File组件 - 附件目录路径:', attachmentDir);
        } else {
          console.warn('app不可用，使用默认附件目录');
          console.log('尝试的app对象:', app);
        }
      } catch (error) {
        console.warn('Electron环境检测到但模块加载失败，使用默认附件目录:', error);
      }
    }
    console.log('-----------------------',attachmentDir);
    return {
      internalValue: [],
      attachmentDir,
      isElectron // 将环境检测结果保存到data中，避免重复检测
    };
  },
  watch: {
    value: {
      handler(newVal) {
        // 当外部传入的value变化时，更新内部值
        if (newVal && Array.isArray(newVal)) {
          // 确保每个文件对象都有fileType、fileName和filePath属性
          this.internalValue = newVal.map((item) => {
            return {
              fileType: item.fileType || "",
              fileName: item.fileName || "",
              filePath: item.filePath || ""
            };
          });
        } else {
          this.internalValue = [];
        }

        // 如果数组为空，添加一个默认文件
        if (!this.internalValue.length) {
          this.internalValue = [
            {
              fileType: "",
              fileName: "",
              filePath: ""
            }
          ];
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {},
  mounted() {
    // 初始化附件目录
    this.initAttachmentDir();

    // 如果初始值为空，添加一个默认文件
    if (!this.internalValue.length) {
      this.internalValue = [
        {
          fileType: "",
          fileName: "",
          filePath: ""
        }
      ];
    }
  },
  methods: {
    // 初始化附件目录
    initAttachmentDir() {
      // 使用函数包装整个初始化逻辑，确保在浏览器环境中不会执行Node.js相关代码
      try {
        // 直接使用data中保存的环境检测结果，避免重复检测
        if (this.isElectron) {
          
          console.log('尝试在Electron环境中初始化附件目录');
          
          // 尝试导入fs模块，避免webpack打包问题
          let fs;
          let fileSystemAvailable = false;
          
          try {
            // 尝试使用window.require避免webpack打包问题
            if (typeof window.require === 'function') {
              try {
                fs = window.require('fs');
                console.log('使用window.require导入fs模块成功');
              } catch (e) {
                console.warn('使用window.require导入fs模块失败:', e);
              }
            }
            
            // 降级尝试常规require
            if (!fs) {
              try {
                fs = require('fs');
                console.log('常规require导入fs模块成功');
              } catch (e) {
                console.warn('常规require导入fs模块失败:', e);
              }
            }
          } catch (requireError) {
            console.error('fs模块导入异常:', requireError);
          }
          
          // 检查文件系统功能是否可用，使用更严格的判断
          if (fs && typeof fs === 'object' &&
              typeof fs.existsSync === 'function' &&
              typeof fs.mkdirSync === 'function') {
            fileSystemAvailable = true;
            console.log('Electron环境文件系统功能检查通过');
          } else {
            console.warn('Electron环境中文件系统功能受限，跳过目录创建');
            return;
          }
          
          if (fileSystemAvailable) {
            console.log('fs模块可用，尝试创建目录');
            
            // 尝试创建目录，但捕获所有可能的错误
            try {
              // 检查目录是否存在
              if (fs.existsSync && typeof fs.existsSync === 'function' && 
                  !fs.existsSync(this.attachmentDir) &&
                  fs.mkdirSync && typeof fs.mkdirSync === 'function') {
                
                try {
                  fs.mkdirSync(this.attachmentDir, { recursive: true });
                  console.log('附件目录创建成功:', this.attachmentDir);
                } catch (mkdirError) {
                  console.warn('创建附件目录失败，但不中断操作:', mkdirError);
                  // 目录创建失败不报错，继续执行
                }
              }
            } catch (error) {
              console.warn('目录检查或创建过程中出错:', error);
            }
          }
        } else {
          // 非Electron环境，不执行任何文件系统操作
          console.log('非Electron环境，跳过目录创建');
        }
      } catch (error) {
        console.warn('附件目录初始化过程中发生未知错误，但不影响程序运行:', error);
      }
    },

    // 处理文件选择
    async handleFileSelect(event, index) {
      // 包装整个方法，确保即使出错也不会导致全局错误
      try {
        const file = event.target.files[0];
        if (!file) return;

        // 先设置基本信息
        this.internalValue[index].fileName = file.name;
        
        // 验证会在保存完成后进行，这里先移除验证以避免过早检查

        // 检查是否可能是Electron环境（简化检测逻辑）
        const isElectron = typeof window !== 'undefined' && 
                         typeof window.process === 'object' &&
                         window.process.versions && 
                         window.process.versions.electron;
        
        // 如果是Electron环境，先检查文件系统功能是否可用
        if (isElectron) {
          try {
            // 尝试导入模块（这部分在浏览器环境中不会被执行，因为if条件已经确保了环境）
            // 使用try-catch包装每个模块的导入，提高容错性
            let fs, path;
            let fileSystemAvailable = false;
            
            try {
              // 尝试使用window.require避免webpack打包问题
              if (typeof window.require === 'function') {
                try {
                  fs = window.require('fs');
                  console.log('fs模块导入成功');
                } catch (e) {
                  console.warn('使用window.require导入fs模块失败:', e);
                }
              }
              
              // 降级尝试常规require
              if (!fs) {
                try {
                  fs = require('fs');
                  console.log('常规require导入fs模块成功');
                } catch (e) {
                  console.warn('常规require导入fs模块失败:', e);
                }
              }
            } catch (requireError) {
              console.error('模块导入异常:', requireError);
            }
            
            // 检查path模块（可选，因为我们有降级的路径处理方法）
            try {
              if (typeof window.require === 'function') {
                try {
                  path = window.require('path');
                  console.log('path模块导入成功');
                } catch (e) {
                  console.warn('path模块导入失败:', e);
                }
              }
            } catch (pathError) {
              console.error('path模块导入异常:', pathError);
            }
            
            // 检查文件系统功能是否可用，使用更严格的判断
            // 不仅检查模块存在，还要确保关键方法可用且有权限
            if (fs && typeof fs === 'object' &&
                typeof fs.writeFileSync === 'function' &&
                typeof fs.existsSync === 'function' &&
                typeof fs.mkdirSync === 'function') {
              fileSystemAvailable = true;
              console.log('Electron环境文件系统功能检查通过');
            } else {
              console.warn('Electron环境中文件系统功能受限，关键方法不可用');
            }
            
            // 只有文件系统功能可用时才尝试使用
            if (fileSystemAvailable) {
              
              // 简化文件名处理，不依赖path模块的所有功能
              let fileExtension = '';
              let baseName = file.name;
              const extIndex = file.name.lastIndexOf('.');
              if (extIndex > 0) {
                fileExtension = file.name.substring(extIndex);
                baseName = file.name.substring(0, extIndex);
              }
              const uniqueFileName = `${Date.now()}_${baseName}${fileExtension}`;
              
              // 使用简单的路径连接，不依赖path.join
              const targetPath = this.attachmentDir.endsWith('/') || this.attachmentDir.endsWith('\\')
                ? `${this.attachmentDir}${uniqueFileName}`
                : `${this.attachmentDir}/${uniqueFileName}`;
              
              // 尝试创建目录，但如果失败也不立即降级
              if (fs.existsSync && typeof fs.existsSync === 'function' && 
                  !fs.existsSync(this.attachmentDir) && 
                  fs.mkdirSync && typeof fs.mkdirSync === 'function') {
                try {
                  fs.mkdirSync(this.attachmentDir, { recursive: true });
                  console.log('附件目录创建成功:', this.attachmentDir);
                } catch (mkdirError) {
                  console.warn('创建附件目录失败，尝试直接保存文件:', mkdirError);
                  // 不立即降级，尝试直接保存文件
                }
              }
              
              try {
                // 读取文件并保存到附件目录
                const fileContent = await file.arrayBuffer();
                // 确保Buffer可用或使用Uint8Array作为替代
                let bufferData;
                if (typeof Buffer !== 'undefined' && Buffer.from) {
                  bufferData = Buffer.from(fileContent);
                } else {
                  bufferData = new Uint8Array(fileContent);
                }
                
                // 尝试保存文件
                fs.writeFileSync(targetPath, bufferData);
                
                // 更新文件信息
                this.internalValue[index].filePath = targetPath;
                this.internalValue[index].fileContent = fileContent;
                this.internalValue[index].fileSize = file.size;
                this.internalValue[index].lastModified = file.lastModified;
                
                console.log('文件保存成功:', targetPath);
              } catch (writeError) {
                console.error('Electron环境中文件保存失败:', writeError);
                // 保存失败时降级到浏览器模式
                console.log('降级到浏览器模式处理文件');
                return this.handleBrowserFileSelect(index, file);
              }
            } else {
              console.log('Electron环境中文件系统功能受限，直接使用浏览器模式处理');
              return this.handleBrowserFileSelect(index, file);
            }
          } catch (electronError) {
            // 捕获所有Electron相关错误并降级
            console.error('Electron环境中文件处理失败，降级到浏览器模式:', electronError);
            return this.handleBrowserFileSelect(index, file);
          }
        } else {
          // 非Electron环境，直接使用浏览器模式
          console.log('非Electron环境，使用浏览器模式处理');
          return this.handleBrowserFileSelect(index, file);
        }
        
        // 触发数据同步更新
        this.handleInputChange();
        // 安全地显示成功消息
        if (typeof this.$message === 'object' && typeof this.$message.success === 'function') {
          this.$message.success('文件上传成功');
        }

        // 重置文件输入，允许重复选择相同文件
        event.target.value = '';
      } catch (error) {
        // 捕获所有可能的错误
        console.error('处理文件选择失败:', error);
        // 安全地显示错误消息
        if (typeof this.$message === 'object' && typeof this.$message.error === 'function') {
          this.$message.error('文件上传失败');
        }
      }
    },
    
    // 浏览器模式处理文件
    async handleBrowserFileSelect(index, file) {
      console.log('进入浏览器模式处理文件');
      try {
        // 使用更宽松的参数验证
        if (!file) {
          console.error('handleBrowserFileSelect: 文件对象为空');
          return;
        }
        
        // 索引验证也更宽松，允许动态创建
        if (typeof index !== 'number' || index < 0) {
          console.warn('handleBrowserFileSelect: 索引无效，使用默认值0');
          index = 0;
        }
        
        // 确保internalValue数组足够大
        while (this.internalValue.length <= index) {
          this.internalValue.push({});
        }
        
        // 获取文件内容
        const fileContent = await file.arrayBuffer();
        
        // 生成虚拟路径，在浏览器环境中使用
        let fileExtension = '';
        let baseName = file.name;
        const extIndex = file.name.lastIndexOf('.');
        if (extIndex > 0) {
          fileExtension = file.name.substring(extIndex);
          baseName = file.name.substring(0, extIndex);
        }
        const virtualPath = `virtual_${Date.now()}_${baseName}${fileExtension}`;
        
        // 更新文件信息，使用更简洁的实现
        try {
          const updatedFiles = [...this.internalValue];
          updatedFiles[index] = {
            ...updatedFiles[index],
            fileName: file.name,
            fileContent: fileContent,
            filePath: virtualPath,
            fileSize: file.size,
            lastModified: file.lastModified
          };
          this.internalValue = updatedFiles;
          console.log('浏览器模式：文件信息更新成功');
        } catch (updateError) {
          console.error('浏览器模式：更新文件信息失败:', updateError);
        }
        
        // 触发数据同步更新
        this.handleInputChange();
        
        // 安全地显示成功消息
        if (typeof this.$message === 'object' && typeof this.$message.success === 'function') {
          this.$message.success('文件上传成功');
        }
      } catch (error) {
        console.error('浏览器模式处理文件失败:', error);
        // 安全地显示错误消息
        if (typeof this.$message === 'object' && typeof this.$message.error === 'function') {
          this.$message.error('文件上传失败');
        }
      }
    },

    handleInputChange() {
      // 触发更新，确保数据同步
      this.$nextTick(() => {
        this.$emit("input", [...this.internalValue]);
      });
    },

    handleAddPerson() {
      this.internalValue.push({
        fileType: "",
        fileName: "",
        filePath: ""
      });
      this.handleInputChange();
    },

    handleDeletePerson(index) {
        this.internalValue.splice(index, 1);
        this.handleInputChange();
    },

    handleOpenFileInput(index) {
      this.$refs[`fileInput-${index}`].click();
    },

    // 文件校验方法
    handleValid() {
      // 检查所有文件对象是否填写完整
      for (const fileObj of this.internalValue) {
        if (!fileObj.fileName || !fileObj.fileName.trim()) {
          this.$message.error("请选择文件");
          return false;
        }
        if (!fileObj.fileType) {
          this.$message.error("请选择文件密级类型");
          return false;
        }
        // 检查文件是否上传成功 - 考虑filePath或fileContent任一存在即可
        if (!fileObj.filePath && !fileObj.fileContent) {
          this.$message.error("文件未上传成功");
          return false;
        }
      }
      return true;
    }
  }
};
</script>

<style lang="less" scoped>
.components-wrapper {
  width: 100%;

  .components-item {
    padding: 8px 24px 8px 0;
    margin-bottom: 16px;
    display: grid;
    grid-template-columns: 45% 45% 5%;
    grid-gap: 16px;
    align-items: center;
  }

  .file-upload-container {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .file-name-input {
    flex: 1;
  }

  .upload-btn-wrapper {
    position: relative;
    overflow: hidden;
    display: inline-block;
  }

  .upload-btn {
    padding: 6px 12px;
    background-color: #2d8cf0;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
  }

  .upload-btn:hover {
    background-color: #57a3f3;
  }

  .file-input {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .line-btn {
    display: flex;
    justify-content: center;

    .add-btn {
      padding: 8px 16px;
      // background-color: #2d8cf0;
      color: #2d8cf0;
      border: 1px solid #2d8cf0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
      display: inline-flex;
      align-items: center;

      &:hover {
        background-color: #57a3f3;
        box-shadow: 0 2px 6px rgba(45, 140, 240, 0.3);
        color: #fff;
      }

      &:active {
        background-color: #1a7de9;
      }
    }
  }
}
</style>
