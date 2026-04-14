# Vue 2 项目模板

这是一个纯净的 Vue 2 项目模板，集成了 Vue Router 和 Vue CLI，专注于 Web 应用开发。

## 特性

- 🚀 **Vue 2.6.14** - 稳定可靠的渐进式框架
- 🛣️ **Vue Router 3.5.1** - 官方路由管理器
- 🔧 **Vue CLI 4.5.0** - 标准工具链
- 📱 **响应式设计** - 支持移动端和桌面端
- ✅ **ESLint** - 代码质量保障
- ⚡ **热重载** - 现代化开发体验

## 项目结构

```
vue2-project-template/
├── public/                 # 静态资源
│   └── index.html         # HTML 模板
├── src/                   # 源代码
│   ├── views/             # 页面组件
│   │   ├── Home.vue       # 首页
│   │   └── About.vue      # 关于页面
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── package.json           # 项目配置
├── vue.config.js          # Vue 配置
├── .eslintrc.js          # 代码规范
└── README.md             # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run serve
```

访问 http://localhost:8080 查看应用

### 3. 构建生产版本

```bash
npm run build
```



## 脚本说明

- `npm run serve` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run lint` - 代码规范检查

## 开发指南

### 添加新页面

1. 在 `src/views/` 目录创建新的 Vue 组件
2. 在 `src/router/index.js` 中添加路由配置
3. 在导航栏中添加对应的路由链接

### 样式规范

- 使用 CSS3 特性实现现代化界面
- 采用响应式设计，支持移动端
- 使用 CSS Grid 和 Flexbox 进行布局

### 代码规范

项目已配置 ESLint，遵循 Vue 官方代码规范。

## 技术栈详情

### 核心依赖

- **Vue 2.6.14** - 主要框架
- **Vue Router 3.5.1** - 路由管理
- **Vue CLI 4.5.0** - 构建工具

### 开发工具

- **ESLint** - 代码质量检查
- **Babel** - JavaScript 编译器
- **Webpack** - 模块打包工具



## 浏览器支持

支持现代浏览器和 IE 11+。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！