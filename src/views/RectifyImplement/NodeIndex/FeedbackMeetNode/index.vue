<template>
  <CommonRender :attrs="attrs" ref="commonRender">
    <template #component-solt>
      <MatterDrawer
        v-if="matterVisible"
        :visible.sync="matterVisible"
        :id="matterId"
        :formDataKey="formDataKey"
        @close="handleClose"
      ></MatterDrawer>
      <FormDrawer
        v-if="formVisible"
        :visible.sync="formVisible"
        @close="handleClose"
        :type="formType"
        :id="formId"
      >
      </FormDrawer>
      <t-upload
        ref="upload"
        v-show="false"
        :autoUpload="false"
        :allowUploadDuplicateFile="true"
        @change="handleChangeFile"
      />
    </template>
  </CommonRender>
</template>

<script>
import * as XLSX from "xlsx";
import CommonRender from "../../Components/CommonRender.vue";
import MatterDrawer from "../../Components/MatterDrawer.vue";
import FormDrawer from "../../Components/FormDrawer.vue";
import { getConfig } from "./config.js";
import {
  copyArrayDataToTarget,
  addItemToTaskArray,
  deleteItemFromTaskArray,
} from "@/utils/index.js";
export default {
  components: {
    CommonRender,
    MatterDrawer,
    FormDrawer,
  },
  props: {},
  data() {
    return {
      matterVisible: false,
      matterId: "",
      formVisible: false,
      formType: "",
      formId: "",
      // 导入文件中文本对应表单字段
      formStringCol: {
        问题类别: "questionsType",
        问题子类: "questionsSubclass",
        具体问题: "questionsContent",
        具体表现: "performanceContent",
        对应四落: "correspondingContent",
        是否重点关注: "focusConcern",
        重点关注情形: "focusSituation",
      },
    };
  },
  computed: {
    attrs() {
      return getConfig.call(this);
    },
    formDataKey() {
      return this.$refs.commonRender?.activeTab;
    },
    // questionsSpecial 对应值
    currentSideBarId() {
      return this.$refs.commonRender?.currentSideBarId;
    },
    formStringCol() {
      const obj1 = {
        问题类别: "questionsType",
        问题子类: "questionsSubclass",
        具体问题: "questionsContent",
        具体表现: "performanceContent",
        对应四落: "correspondingContent",
        是否重点关注: "focusConcern",
        重点关注情形: "focusSituation",
      };
      const obj2 = {
        问题类别: "questionsType",
        问题子类: "questionsSubclass",
        具体问题: "questionsContent",
        具体表现: "performanceContent",
        对应聚焦: "correspondingContent",
        是否重点关注: "focusConcern",
        重点关注情形: "focusSituation",
      };
      return window.APP_CONFIG.isProvince ? obj1 : obj2;
    },
  },
  mounted() {},
  methods: {
    handleImport() {
      this.$refs.upload.triggerUpload();
    },
    handleChangeFile(value) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const data = e.target.result;
        // XLSX读取文件内容
        const workbook = XLSX.read(data, { type: "binary" });
        // 获取文件第一个sheet名称
        let wsname = "";
        if (Array.isArray(workbook.SheetNames) && workbook.SheetNames.length) {
          wsname = workbook.SheetNames[0];
        }
        // 获取第一个sheet内容数据
        const ws = wsname
          ? XLSX.utils.sheet_to_json(workbook.Sheets[wsname])
          : [];
        if (Array.isArray(ws) && ws.length) {
          ws.forEach((w) => {
            let formData = {
              questionsSpecial: this.currentSideBarId,
            };
            let keys = Object.keys(w);
            keys.forEach((k) => {
              formData[this.formStringCol[k]] = w[k];
            });
            addItemToTaskArray(this.formDataKey, formData, this.$db);
          });
          this.$refs.commonRender.handleRefresh();
        }
      };
      fileReader.readAsBinaryString(value[0].raw);
    },
    handleClose(type = false) {
      if (type) {
        this.$refs.commonRender.handleRefresh();
      }
      this.matterVisible = false;
      this.formVisible = false;
    },
    handleOpenFormDrawer(type, id = "") {
      this.formVisible = true;
      this.formType = type;
      this.formId = id;
    },
    handleOpenMatterDrawer(id = "") {
      this.matterVisible = true;
      this.matterId = id;
    },
    handleSave() {
      let mydialog = this.$dialog({
        header: "保存",
        body: "确认保存数据内容？(确认后，该环节相关数据将自动带入后续环节。若后续环节已有数据，保存后将覆盖后续环节已有数据。)",
        onConfirm: async ({ e }) => {
          try {
            // 使用通用方法将FeedbackMeetNode-problemList数据复制到RectificationPlanNode-fill
            const success = await copyArrayDataToTarget(
              "FeedbackMeetNode-problemList",
              "RectificationPlanNode-fill",
              this.$db
            );

            if (success) {
              this.$message.success("数据保存成功，已自动带入后续环节");
              // 刷新页面数据
              this.$refs.commonRender.handleRefresh();
            } else {
              this.$message.error("数据保存失败，请重试");
            }
          } catch (error) {
            console.error("保存数据失败:", error);
            this.$message.error("数据保存失败，请重试");
          }

          mydialog.hide();
        },
      });
    },
    handleDelete(row) {
      deleteItemFromTaskArray(this.formDataKey, row.id, this.$db);
      this.$refs.commonRender.handleRefresh();
    },
  },
};
</script>

<style lang="less" scoped></style>
