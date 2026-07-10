<template>
  <div class="app-container">
    <!-- 顶部波浪背景 -->
    <div class="wave-bg">
      <div class="wave"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>

    <!-- 主标题 -->
    <div class="title-section">
      <h1 class="main-title">巡视巡察整改实时跟踪系统</h1>
      <p class="sub-title">(单机版)</p>
    </div>

    <!-- 表单卡片 -->
    <div class="form-card" :class="{ 'fade-in': isLoaded }">
      <form @submit.prevent="handleSubmit">
        <div
          class="form-group"
          v-for="(field, index) in formFields"
          :key="index"
        >
          <label class="form-label">{{ field.label }}</label>
          <input
            v-model="formData[field.key]"
            :placeholder="field.placeholder"
            class="form-input"
          />
        </div>

        <!-- 按钮组 -->
        <div class="button-group">
          <button type="submit" class="primary-btn" :disabled="!isFormValid">
            进入整改环节
          </button>
          <!-- <button type="button" class="secondary-btn" @click="resetForm">
            开启新一轮
          </button> -->
        </div>
      </form>
    </div>

    <!-- 右上角导出按钮 -->
    <button class="export-btn" @click="handleExport">
      <i class="export-icon">↓</i> 打包导出
    </button>
  </div>
</template>

<script>
import { FLOW_DATA_LIST } from "@/utils/map";
import { addItemToTaskArray } from "@/utils/index.js";
export default {
  data() {
    return {
      // 表单数据
      formData: {
        session: "",
        round: "",
        inspectionTeam: "",
        inspectionType: "",
        organization: "",
      },
      // 当前任务ID
      currentTaskId: null,
      // 表单字段配置
      formFields: [
        { label: "届次", key: "session", placeholder: "请输入" },
        { label: "轮次", key: "round", placeholder: "请输入" },
        { label: `${window.APP_CONFIG.isProvince?"巡视":"巡察"}组`, key: "inspectionTeam", placeholder: "请输入" },
        { label: `${window.APP_CONFIG.isProvince?"巡视":"巡察"}类型`, key: "inspectionType", placeholder: "请输入" },
        {
          label: `${window.APP_CONFIG.isProvince?"被巡视":"被巡察"}党组织名称`,
          key: "organization",
          placeholder: "请输入",
        },
      ],
      // 输入框聚焦状态
      // 页面加载状态
      isLoaded: false,
    };
  },

  computed: {
    // 表单验证：检查所有字段是否已填写
    isFormValid() {
      return Object.values(this.formData).every((value) => value.trim() !== "");
    },
    nodeList() {
      let arr = [
        {
          id: "巡视",
          order: 1,
          name: "巡视",
        },
        {
          id: "选人用人专项",
          order: 2,
          name: "选人用人专项",
        },
        {
          id: "意识形态专项",
          order: 3,
          name: "意识形态专项",
        },
        {
          id: "立行立改",
          order: 4,
          name: "立行立改",
        },
        {
          id: "巡察专项",
          order: 5,
          name: "巡察专项",
        },
      ];
      if (window.APP_CONFIG.isProvince) {
        return arr
      }else{
        arr[0].id='巡察'
        arr[0].name='巡察'
        arr.splice(4,1)
        return arr
      }
    },
  },

  mounted() {
    // 页面加载完成后显示表单动画
    setTimeout(() => {
      this.isLoaded = true;
    }, 100);

    // 初始化表单数据
    this.initFormData();
  },

  methods: {
    //初始化表单数据
    async initFormData() {
      try {
        // 首先获取当前任务ID
        const res = await this.$db.findById("currentTaskId", 1);
        if (res && res.currentTaskId) {
          this.currentTaskId = res.currentTaskId;
          console.log("当前任务ID已从数据库获取:", this.currentTaskId);

          // 根据currentTaskId筛选对应的userInfo数据
          try {
            const userInfo = await this.$db.findById(
              "userInfo",
              this.currentTaskId
            );
            if (userInfo) {
              // 将userInfo数据填充到formData中
              this.formData = {
                session: userInfo.session || "",
                round: userInfo.round || "",
                inspectionTeam: userInfo.inspectionTeam || "",
                inspectionType: userInfo.inspectionType || "",
                organization: userInfo.organization || "",
              };
              console.log("用户数据已从数据库获取并填充到表单:", this.formData);
            }
          } catch (error) {
            console.error("根据任务ID获取用户数据失败:", error);
          }
        }
      } catch (error) {
        console.error("获取当前任务ID失败:", error);
      }
    },
    // 表单提交处理
    async handleSubmit() {
      // 检查数据库中是否已存在相同数据
      const existingData = this.findExistingData();

      if (existingData) {
        // 如果存在相同数据，取出该条数据
        console.log("数据库中已存在相同数据:", existingData);
        // 这里可以处理已存在数据的情况，比如提示用户或直接使用现有数据
        this.$message.info(
          `系统中已存在相同记录，将使用现有数据。记录ID: ${existingData.id}`
        );

        // 保存当前任务ID
        this.currentTaskId = existingData.id;
        // 将currentTaskId保存到数据库
        try {
          // 检查是否已存在currentTask记录
          const existingTask = await this.$db.findById("currentTaskId", 1);
          if (existingTask) {
            // 更新现有记录 - 将currentTaskId包装在对象中
            await this.$db.update("currentTaskId", 1, {
              currentTaskId: String(this.currentTaskId),
            });
          } else {
            // 添加新记录 - 将currentTaskId包装在对象中
            await this.$db.add("currentTaskId", {
              currentTaskId: String(this.currentTaskId),
              id: 1,
            });
          }
          console.log("当前任务ID已保存到数据库:", this.currentTaskId);
        } catch (error) {
          console.error("保存当前任务ID失败:", error);
        }

        // 调用initFlowData初始化流程数据
        // await this.initFlowData();

        this.$router.push({
          path: "/patrol",
          query: { existingData: JSON.stringify(existingData) },
        });
      } else {
        // 如果不存在相同数据，添加新数据
        console.log("添加新数据到数据库:", this.formData);

        try {
          const res = await this.$db.add("userInfo", this.formData);
          if (res) {
            this.$message.success("数据保存成功！");
            // 保存当前任务ID
            this.currentTaskId = res.id;
            // 将currentTaskId保存到数据库
            try {
              // 检查是否已存在currentTask记录
              const existingTask = await this.$db.findById("currentTaskId", 1);
              if (existingTask) {
                // 更新现有记录 - 将currentTaskId包装在对象中
                await this.$db.update("currentTaskId", 1, {
                  currentTaskId: String(this.currentTaskId),
                });
              } else {
                // 添加新记录 - 将currentTaskId包装在对象中
                await this.$db.add("currentTaskId", {
                  currentTaskId: String(this.currentTaskId),
                  id: 1,
                });
              }
              console.log("当前任务ID已保存到数据库:", this.currentTaskId);
            } catch (error) {
              console.error("保存当前任务ID失败:", error);
            }
            // 数据保存成功后跳转
            if (this.isFormValid) {
              // 初始化整改数据结构和流程数据
              await this.initFlowData();
              this.$router.push("/patrol");
            }
          }
        } catch (error) {
          this.$message.error("数据保存失败，请重试");
        }
      }
    },
    // 判断数据库中是否已存在相同数据
    findExistingData() {
      try {
        // 获取所有用户信息数据
        const allUserInfo = this.$db.getTable("userInfo");

        // 检查是否存在与当前表单数据完全匹配的记录（去除空格判断）
        const existingRecord = allUserInfo.find(
          (record) =>
            record.session?.trim() === this.formData.session?.trim() &&
            record.round?.trim() === this.formData.round?.trim() &&
            record.inspectionTeam?.trim() ===
              this.formData.inspectionTeam?.trim() &&
            record.inspectionType?.trim() ===
              this.formData.inspectionType?.trim() &&
            record.organization?.trim() === this.formData.organization?.trim()
        );

        return existingRecord || null;
      } catch (error) {
        console.error("查询数据库失败:", error);
        return null;
      }
    },
    // 重置表单
    resetForm() {
      this.formData = {
        session: "",
        round: "",
        inspectionTeam: "",
        inspectionType: "",
        organization: "",
      };
      this.$router.push("/DatabaseExample");
    },

    // 导出功能处理
    async handleExport() {
      if (!this.isFormValid) {
        this.$message.info("请先填写完整表单信息再导出");
        return;
      }

      try {
        const isElectron =
          typeof window !== "undefined" &&
          window.process &&
          window.process.type;

        if (isElectron) {
          // Electron环境：打包数据库和附件文件夹
          const fs = window.require("fs");
          const path = window.require("path");
          let dialog;
          let app;

          // 获取dialog模块
          if (window.require("@electron/remote")) {
            dialog = window.require("@electron/remote").dialog;
            app = window.require("@electron/remote").app;
          } else if (window.require("electron").remote) {
            dialog = window.require("electron").remote.dialog;
            app = window.require("electron").remote.app;
          } else {
            throw new Error("无法找到electron remote模块");
          }

          // 获取应用安装目录和attachments文件夹路径
          // let appPath = app.getAppPath();
          // console.log('原始appPath:', appPath);
          
          // if (process.env.NODE_ENV !== "development") {
          //   console.log('当前环境: 生产环境');
          //   if (appPath.endsWith("app.asar")) {
          //     console.log('检测到app.asar路径，开始处理安装目录根路径...');
          //     // 先获取resources目录
          //     const resourcesPath = path.dirname(appPath);
          //     console.log('resources目录:', resourcesPath);
          //     // 再获取安装根目录
          //     appPath = path.dirname(resourcesPath);
          //     console.log('安装根目录:', appPath);
          //   } else {
          //     console.log('未检测到app.asar路径，使用原始路径');
          //   }
          // } else {
          //   console.log('当前环境: 开发环境');
          // }
          const userDataPath = app.getPath('userData');
          const attachmentsPath = path.join(userDataPath, "attachments");
          console.log('最终appPath:', userDataPath);
          console.log('附件路径:', attachmentsPath);
          //           const userDataPath = app.getPath('userData');

          // // 获取安装目录根路径（去除app.asar部分）
          // let installRootPath = appPath;
          // if (appPath.endsWith('app.asar')) {
          //   installRootPath = path.dirname(appPath);
          // }

          // // 根据环境选择路径：开发环境使用安装目录，生产环境使用userDataPath
          // const isDevelopment = process.env.NODE_ENV === 'development';
          // const basePath = isDevelopment ? installRootPath : userDataPath;
          // const attachmentsPath = path.join(basePath, 'attachments');

          // console.log('当前环境:', process.env.NODE_ENV);
          // console.log('原始appPath:', appPath);
          // console.log('安装根路径:', installRootPath);
          // console.log('基础路径:', basePath);
          // console.log('附件路径:', attachmentsPath);

          // 显示保存对话框
          const saveResult = await dialog.showSaveDialog({
            title: "导出数据",
            defaultPath: "cdi-rectification-export.zip",
            filters: [{ name: "压缩文件", extensions: ["zip"] }],
          });

          if (saveResult.canceled || !saveResult.filePath) {
            return;
          }

          // 临时文件夹路径 - 使用用户数据目录而不是安装目录

          const tempDir = path.join(userDataPath, "temp_export");

          // 确保临时文件夹存在
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          console.log('临时文件夹路径:', tempDir);

          // 导出数据库到临时文件夹
          const dbFilePath = path.join(tempDir, "database.json");
          const dbData = JSON.stringify(this.$db.getDatabase(), null, 2);
          fs.writeFileSync(dbFilePath, dbData, "utf8");

          // 复制attachments文件夹内容到临时文件夹
          if (fs.existsSync(attachmentsPath)) {
            const tempAttachmentsPath = path.join(tempDir, "attachments");
            if (!fs.existsSync(tempAttachmentsPath)) {
              fs.mkdirSync(tempAttachmentsPath, { recursive: true });
            }

            // 简单的文件复制函数
            const copyRecursiveSync = (src, dest) => {
              const exists = fs.existsSync(src);
              const stats = exists && fs.statSync(src);
              const isDirectory = exists && stats.isDirectory();

              if (isDirectory) {
                if (!fs.existsSync(dest)) {
                  fs.mkdirSync(dest, { recursive: true });
                }
                fs.readdirSync(src).forEach((childItemName) => {
                  copyRecursiveSync(
                    path.join(src, childItemName),
                    path.join(dest, childItemName)
                  );
                });
              } else {
                fs.copyFileSync(src, dest);
              }
            };

            // 复制attachments文件夹内容
            fs.readdirSync(attachmentsPath).forEach((file) => {
              const srcPath = path.join(attachmentsPath, file);
              const destPath = path.join(tempAttachmentsPath, file);
              copyRecursiveSync(srcPath, destPath);
            });
          }

          // 使用JSZip进行压缩（需要先安装jszip包）
          try {
            // 动态导入JSZip
            const { default: JSZip } = await import("jszip");
            const zip = new JSZip();

            // 添加数据库文件
            zip.file("database.json", fs.readFileSync(dbFilePath, "utf8"));

            // 添加attachments文件夹内容
            if (fs.existsSync(path.join(tempDir, "attachments"))) {
              await this.addFolderToZip(
                zip,
                "attachments",
                path.join(tempDir, "attachments"),
                fs,
                path
              );
            }

            // 生成zip文件
            const content = await zip.generateAsync({ type: "nodebuffer" });
            fs.writeFileSync(saveResult.filePath, content);

            this.$message.success("数据导出成功！");
            console.log("数据已成功导出到:", saveResult.filePath);
          } catch (zipError) {
            console.error("压缩文件创建失败:", zipError);
            this.$message.error("压缩文件创建失败，请重试");
          } finally {
            // 清理临时文件
            if (fs.existsSync(tempDir)) {
              try {
                const rimraf = (dir) => {
                  if (fs.existsSync(dir)) {
                    fs.readdirSync(dir).forEach((file) => {
                      const curPath = path.join(dir, file);
                      if (fs.lstatSync(curPath).isDirectory()) {
                        rimraf(curPath);
                      } else {
                        fs.unlinkSync(curPath);
                      }
                    });
                    fs.rmdirSync(dir);
                  }
                };
                rimraf(tempDir);
              } catch (cleanupError) {
                console.warn("清理临时文件失败:", cleanupError);
              }
            }
          }
        } else {
          // 浏览器环境：由于安全限制，只能导出数据库JSON
          this.$db.backup();
          this.$message.info(
            "浏览器环境下仅导出数据库文件，无法打包附件文件夹"
          );
        }
      } catch (error) {
        console.error("导出功能失败:", error);
        this.$message.error("导出失败，请重试");
      }
    },

    // 辅助方法：递归添加文件夹到zip
    async addFolderToZip(zip, zipPath, realPath, fs, path) {
      const files = fs.readdirSync(realPath);

      for (const file of files) {
        const filePath = path.join(realPath, file);
        const fileStats = fs.statSync(filePath);

        if (fileStats.isDirectory()) {
          // 递归处理子文件夹
          await this.addFolderToZip(
            zip,
            `${zipPath}/${file}`,
            filePath,
            fs,
            path
          );
        } else {
          // 添加文件
          const content = fs.readFileSync(filePath);
          zip.file(`${zipPath}/${file}`, content);
        }
      }
    },
    //初始化流程数据
    async initFlowData() {
      try {
        // 初始化流程数据 - 以FLOW_DATA_LIST中的value为key，值为数组
        const flowData = {};
        FLOW_DATA_LIST.forEach((item) => {
          flowData[item.value] = [];
        });
        // 添加新数据
        await this.$db.add(this.currentTaskId, { ...flowData, id: 1 });
        this.handleSetFeedbackMeetNode();
        this.handleSetFeedbackMeetAdviceNodeAdvice();
        this.handleSetSpecialMeetNodeRectification();
        this.handleSetRectificationReportNodeReport();
        this.handleSetPublicRectificationSituationNodeSituation();
        console.log("初始化流程数据成功:", flowData);
      } catch (error) {
        console.error("初始化流程数据失败:", error);
      }
    },
    // 设置反馈会初始化数据
    handleSetFeedbackMeetNode() {
      addItemToTaskArray(
        "FeedbackMeetNode-feedback",
        {
          title: "反馈会(一对一反馈)工作方案",
          sub: [
            {
              subTitle: `向被${window.APP_CONFIG.isProvince? '巡视':'巡察'}党组织主要负责人反馈`,
              subsetItemList: [
                {
                  fieldName: "时间",
                  fieldType: "2",
                  content: [],
                },
                {
                  fieldName: "地点",
                  fieldType: "0",
                  content: "",
                },
              ],
            },
            {
              subTitle: `向被${window.APP_CONFIG.isProvince? '巡视':'巡察'}党组织领导班子反馈`,
              subsetItemList: [
                {
                  fieldName: "时间",
                  fieldType: "2",
                  content: [],
                },
                {
                  fieldName: "地点",
                  fieldType: "0",
                  content: "",
                },
              ],
            },
            {
              subTitle: "反馈会工作方案",
              isAdd: true,
              subsetItemList: [
                {
                  fieldName: "密级",
                  fieldType: "1",
                  content: "",
                  fileName: "",
                  filePath: "",
                },
              ],
            },
          ],
        },
        this.$db
      );
      addItemToTaskArray(
        "FeedbackMeetNode-feedback",
        {
          title: "反馈会(一对一反馈)情况",
          sub: [
            {
              subTitle: "反馈材料签收时间",
              subsetItemList: [
                {
                  fieldName: "时间",
                  fieldType: "2",
                  content: [],
                },
              ],
            },
            {
              subTitle: `${window.APP_CONFIG.isProvince?"巡视":"巡察"}反馈材料签收单`,
              isAdd: true,
              subsetItemList: [
                {
                  fieldName: "密级",
                  fieldType: "1",
                  content: "",
                  fileName: "",
                  filePath: "",
                },
              ],
            },
            {
              subTitle: "反馈会(一对一反馈)领导表态发言",
              isAdd: true,
              subsetItemList: [
                {
                  fieldName: "密级",
                  fieldType: "1",
                  content: "",
                  fileName: "",
                  filePath: "",
                },
              ],
            },
          ],
        },
        this.$db
      );
      addItemToTaskArray(
        "FeedbackMeetNode-feedback",
        {
          title: "其他",
          sub: [
            {
              subTitle: "其他",
              isAdd: true,
              subsetItemList: [
                {
                  fieldName: "密级",
                  fieldType: "1",
                  content: "",
                  fileName: "",
                  filePath: "",
                },
              ],
            },
          ],
        },
        this.$db
      );
    },
    // 设置公开初始化数据
    handleSetFeedbackMeetAdviceNodeAdvice() {
      const list = [
        `${window.APP_CONFIG.isProvince?"巡视":"巡察"}反馈新闻稿`,
        `${window.APP_CONFIG.isProvince?"巡视":"巡察"}反馈意见党内通报`,
        `${window.APP_CONFIG.isProvince?"巡视":"巡察"}反馈新闻稿舆情上报`,
        `${window.APP_CONFIG.isProvince?"巡视":"巡察"}反馈意见党内通报舆情上报`,
        "其他",
      ];
      list.forEach((o) => {
        addItemToTaskArray(
          "FeedbackMeetAdviceNode-advice",
          {
            title: o,
            sub: [
              {
                subTitle: o,
                isAdd: true,
                subsetItemList: [
                  {
                    fieldName: "密级",
                    fieldType: "1",
                    content: "",
                    fileName: "",
                    filePath: "",
                  },
                ],
              },
            ],
          },
          this.$db
        );
      });
    },
    // 设置整改专题会议初始化数据
    handleSetSpecialMeetNodeRectification() {
      addItemToTaskArray(
        "SpecialMeetNode-rectification",
        {
          title: "召开整改专题会议",
          fileList: [
            {
              matter: "整改专题会议",
              files: [],
            },
            {
              matter: "其他",
              files: [],
            },
          ],
        },
        this.$db
      );
      addItemToTaskArray(
        "SpecialMeetNode-life",
        {
          title: "民主生活会会议方案",
          fileList: [
            {
              matter: "召开关于民主生活的报告",
              files: [],
            },
            {
              matter: "民主生活会会议方案",
              files: [],
            },
            {
              matter: "谈心谈话记录",
              files: [],
            },
            {
              matter: "征求党员、干部和群众的意见建议",
              files: [],
            },
            {
              matter: "其他",
              files: [],
            },
          ],
        },
        this.$db
      );
      addItemToTaskArray(
        "SpecialMeetNode-life",
        {
          title: "召开民主生活会",
          fileList: [
            {
              matter: "会议情况报告",
              files: [],
            },
            {
              matter: "其他",
              files: [],
            },
          ],
        },
        this.$db
      );
      addItemToTaskArray(
        "SpecialMeetNode-life",
        {
          title: "其他",
          fileList: [
            {
              matter: "其他",
              files: [],
            },
          ],
        },
        this.$db
      );
    },
    // 设置整改情况报告初始化数据
    handleSetRectificationReportNodeReport() {
      const list = [
        `关于${window.APP_CONFIG.isProvince? '省委巡视组巡视':'市/县（区）委巡察组巡察'}反馈意见整改进展情况的报告`,
        `关于${window.APP_CONFIG.isProvince? '省委巡视组巡视':'市/县（区）委巡察组巡察'}移交问题线索处置情况的报告`,
        `${window.APP_CONFIG.isProvince? '巡视':'巡察'}反馈意见整改落实情况统计表`,
        `落实${window.APP_CONFIG.isProvince? '省委巡视组':'市/县（区）委巡察组'}反馈问题处理的干部情况汇总表`,
        `${window.APP_CONFIG.isProvince? '省委巡视组':'市/县（区）委巡察组'}移交信访件处理情况汇总表`,
        "其他",
      ];
      this.nodeList.forEach(i =>{
        list.forEach((o) => {
          addItemToTaskArray(
              "RectificationReportNode-report",
              {
                title: o,
                fileList: [],
                questionsSpecial:i.id,
              },
              this.$db
          );
        });
      })

    },
    // 设置公开整改情况初始化数据
    handleSetPublicRectificationSituationNodeSituation() {
      const list = [
        "拟不公开事项报告（随附党内通报、社会公开稿）",
        "公开整改情况党内通报（正式通报）",
        "公开整改情况社会公开（正式通报）",
        "公开整改情况党内通报舆情上报",
        "公开整改情况社会公开舆情上报",
      ];
      list.forEach((o) => {
        addItemToTaskArray(
          "PublicRectificationSituationNode-situation",
          {
            title: o,
            fileList: [],
          },
          this.$db
        );
      });
    },
  },
};
</script>

<style scoped>
/* 基础样式 */
.app-container {
  min-height: 100vh;
  background: url("./images/login_bg.jpg") no-repeat center center fixed;
  background-size: cover;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

/* 标题部分 */
.title-section {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem 0;
  color: #fff;
}

.main-title {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sub-title {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* 表单卡片 */
.form-card {
  position: relative;
  z-index: 2;
  max-width: 550px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-out;
}

.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1a6ed8;
  box-shadow: 0 0 0 3px rgba(26, 110, 216, 0.1);
}

.input-focus {
  border-color: #1a6ed8;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background-color: #1a6ed8;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background-color: #145dba;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(26, 110, 216, 0.2);
}

.primary-btn:disabled {
  background-color: #8fb8e8;
  cursor: not-allowed;
}

.secondary-btn {
  background-color: white;
  color: #1a6ed8;
  border: 1px solid #1a6ed8;
}

.secondary-btn:hover {
  background-color: #f0f7ff;
  transform: translateY(-2px);
}

/* 导出按钮 */
.export-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: #1a6ed8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.export-btn:hover {
  background-color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07);
}

.export-icon {
  font-size: 0.8rem;
}
</style>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f5f7fa;
}

/* 动画关键帧 */
@keyframes wave-animation {
  0% {
    background-position-x: 0;
  }

  100% {
    background-position-x: 1440px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 1.8rem;
  }

  .form-card {
    padding: 1.8rem;
    margin: 0 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .export-btn {
    top: auto;
    bottom: 1.5rem;
    right: 1.5rem;
  }
}
</style>
