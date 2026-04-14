# Windows系统打包Linux arm64 deb包指南

## 方法一：使用Docker（推荐）

### 1. 安装Docker Desktop
- 下载并安装Docker Desktop for Windows
- 启用WSL2后端（推荐）

### 2. 使用Docker打包命令
```bash
# 打包arm64 deb包
npm run electron:build:docker:linux:deb:arm64
```

### 3. Docker镜像说明
使用官方electron-builder镜像：`electronuserland/builder:wine`
- 包含完整的Linux打包环境
- 支持多架构交叉编译
- 自动处理依赖关系

## 方法二：使用WSL2（次推荐）

### 1. 安装WSL2
```powershell
# 启用WSL功能
wsl --install

# 安装Ubuntu发行版
wsl --install -d Ubuntu
```

### 2. 在WSL中设置环境
```bash
# 进入WSL
wsl

# 安装Node.js和npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装必要的依赖
sudo apt-get install -y fakeroot dpkg rpm
```

### 3. 使用WSL打包
```bash
# 在Windows PowerShell中运行
npm run electron:build:wsl:linux:deb:arm64

# 或者在WSL中直接运行
cd /mnt/d/zhongyou/cdi-rectification-desktop-ui
npm install
npm run electron:build:linux:deb:arm64
```

## 方法三：虚拟机方式

### 1. 安装VirtualBox或VMware
- 创建Ubuntu arm64虚拟机
- 安装必要的开发工具

### 2. 共享项目文件夹
- 将项目文件夹共享到虚拟机
- 在虚拟机中执行打包命令

## 打包脚本说明

### 可用的打包命令
```bash
# 打包所有Linux格式（包含arm64）
npm run electron:build:linux

# 仅打包deb格式（包含arm64）
npm run electron:build:linux:deb

# 仅打包arm64架构的deb包
npm run electron:build:linux:deb:arm64

# 使用Docker打包arm64 deb包
npm run electron:build:docker:linux:deb:arm64

# 使用WSL打包arm64 deb包
npm run electron:build:wsl:linux:deb:arm64
```

## 配置说明

### package.json中的关键配置
```json
{
  "linux": {
    "target": [
      {
        "target": "deb",
        "arch": ["x64", "arm64"]
      }
    ],
    "artifactName": "${productName}-v${version}-linux-${arch}.${ext}"
  }
}
```

## 常见问题解决

### 1. Docker权限问题
```bash
# 在Docker Desktop中启用Linux容器模式
# 或使用管理员权限运行PowerShell
```

### 2. WSL文件权限问题
```bash
# 在WSL中修复文件权限
sudo chown -R $USER:$USER /mnt/d/zhongyou/cdi-rectification-desktop-ui
```

### 3. 依赖缺失问题
```bash
# 在WSL中安装必要的依赖
sudo apt-get update
sudo apt-get install -y fakeroot dpkg rpm libgtk2.0-0 libnotify4 libnss3 libxss1 libxtst6 xvfb
```

### 4. 内存不足问题
- 增加Docker内存限制（建议4GB以上）
- 清理Docker镜像和容器

## 输出文件

打包成功后，在`build`目录下会生成：
- `整改落实-v1.0.0-linux-arm64.deb` (arm64架构deb包)
- `整改落实-v1.0.0-linux-x64.deb` (x64架构deb包)

## 验证打包结果

### 1. 检查文件架构
```bash
# 使用file命令检查二进制文件架构
file build/整改落实-v1.0.0-linux-arm64.deb
```

### 2. 在arm64设备上测试
- 将deb包传输到arm64 Linux设备
- 使用dpkg安装测试
```bash
sudo dpkg -i 整改落实-v1.0.0-linux-arm64.deb
```

## 最佳实践

1. **使用Docker方式**：最稳定，环境隔离好
2. **定期清理缓存**：避免磁盘空间不足
3. **测试多架构**：确保x64和arm64都能正常工作
4. **版本控制**：每次发布前更新版本号

## 注意事项

1. **性能考虑**：arm64打包需要更多时间和资源
2. **依赖兼容性**：确保所有依赖都支持arm64架构
3. **测试环境**：建议在实际arm64设备上测试
4. **安全更新**：定期更新Docker镜像和系统依赖

通过以上方法，您可以在Windows系统上成功打包arm64架构的Linux deb包。