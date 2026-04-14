// 首先加载环境变量（如果存在）
const dotenv = require("dotenv");
const path = require("path");

// 根据不同环境加载对应的.env文件
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: path.join(__dirname, envFile) });

const { app, BrowserWindow, Menu, dialog, protocol } = require("electron");
const url = require("url");

// 启用@electron/remote模块
require('@electron/remote/main').initialize();

// 开发环境下的热重载功能
if (process.env.NODE_ENV === "development") {
  try {
    require("electron-reloader")(module, {
      debug: true,
      watchRenderer: false
    });
  } catch (error) {
    console.log("热重载模块加载失败:", error.message);
  }
}

// 使用环境变量设置应用名称，默认值作为备选
app.name = process.env.VUE_APP_TITLE || "Vue2 Electron App";

// 保持对window对象的全局引用，避免被JavaScript垃圾回收
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    // 使用环境变量设置窗口标题
    title: process.env.VUE_APP_TITLE || "Vue2 Electron App",
    // 设置窗口图标
    icon: path.join(__dirname, "public/favicon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // 根据环境变量决定是否启用devTools
      devTools:
        process.env.VUE_APP_DEBUG === "true" ||
        process.env.NODE_ENV === "development",
      // 禁用一些可能导致警告的功能
      autoplayPolicy: "document-user-activation-required",
      // 禁用不必要的功能以减少警告
      enableBlinkFeatures: "",
    },
    // 禁用硬件加速以减少兼容性问题
    webgl: false,
  });

  // 开发环境加载本地服务器，生产环境加载构建文件
  if (process.env.NODE_ENV === "development") {
    // 尝试连接8080端口，如果失败则尝试8081端口
    const tryLoadURL = (port) => {
      mainWindow.loadURL(`http://localhost:${port}`).catch(() => {
        if (port === 8080) {
          tryLoadURL(8081); // 尝试8081端口
        } else {
          console.error(`无法连接到开发服务器，请确保Vue开发服务器正在运行`);
        }
      });
    };
    
    tryLoadURL(8080);
    
    // 在开发环境下，等待页面加载完成后再打开开发者工具
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        mainWindow.webContents.openDevTools();
      }, 1000);
    });
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "dist/index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  // 窗口关闭时触发
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
  
  // 启用remote模块
  require('@electron/remote/main').enable(mainWindow.webContents);
  
  // 创建应用菜单
  createMenu();
}

// 创建应用菜单
function createMenu() {
  // 基础菜单模板
  const baseTemplate = [];

  // macOS特殊处理
  if (process.platform === "darwin") {
    baseTemplate.push({
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }

  // 编辑菜单
  baseTemplate.push({
    label: "编辑",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "delete" },
      { role: "selectall" },
    ],
  });

  // 视图菜单 - 根据环境变量决定是否显示调试相关选项
  const viewSubmenu = [{ role: "reload" }, { role: "forcereload" }];

  // 调试模式下添加开发者工具选项
  if (
    process.env.VUE_APP_DEBUG === "true" ||
    process.env.NODE_ENV === "development"
  ) {
    viewSubmenu.push({ role: "toggledevtools" });
  }

  viewSubmenu.push(
    { type: "separator" },
    { role: "resetzoom" },
    { role: "zoomin" },
    { role: "zoomout" },
    { type: "separator" },
    { role: "togglefullscreen" }
  );

  baseTemplate.push({
    label: "视图",
    submenu: viewSubmenu,
  });

  // 窗口菜单
  baseTemplate.push({
    label: "窗口",
    submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
  });

  // 环境信息菜单（仅开发环境显示）
  if (process.env.NODE_ENV === "development") {
    baseTemplate.push({
      label: "环境信息",
      submenu: [
        {
          label: `环境: ${process.env.NODE_ENV}`,
          enabled: false,
        },
        {
          label: `API: ${process.env.VUE_APP_API_BASE_URL}`,
          enabled: false,
        },
        {
          label: `调试模式: ${process.env.VUE_APP_DEBUG}`,
          enabled: false,
        },
      ],
    });
  }

  // Windows平台不显示应用菜单
  // if (process.platform === "darwin") {
  //   Menu.setApplicationMenu(Menu.buildFromTemplate(baseTemplate));
  // } else {
  //   Menu.setApplicationMenu(Menu.buildFromTemplate(baseTemplate));
  // }
  Menu.setApplicationMenu(null)
}

// 处理错误
function handleError(error) {
  console.error("Error:", error);
  if (process.env.NODE_ENV !== "development") {
    dialog.showErrorBox("错误", error.message || "应用发生错误");
  }
}

// 监听未捕获的异常
process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

// Electron 完成初始化后创建窗口
app.whenReady().then(() => {
  createWindow();

  // 在macOS上点击dock图标时重新创建窗口
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 关闭所有窗口时退出应用
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
