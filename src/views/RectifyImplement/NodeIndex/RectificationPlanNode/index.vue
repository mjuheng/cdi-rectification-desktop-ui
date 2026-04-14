<template>
  <CommonRender :attrs="attrs" ref="commonRender">
    <template #component-solt>
      <FormDialog
        v-if="addVisible"
        :visible="addVisible"
        :currentSideBarId="currentSideBarId"
        @close="handleClose"
      ></FormDialog>
      <MatterEditDrawer
        :visible.sync="matterVisible"
        @close="handleClose"
        :id="matterId"
        v-if="matterVisible"
      ></MatterEditDrawer>
    </template>
  </CommonRender>
</template>

<script>
import CommonRender from "../../Components/CommonRender.vue";
import MatterEditDrawer from "../../Components/MatterEditDrawer.vue";

import FormDialog from "./FormDialog.vue";
import { getConfig } from "./config.js";
import {
  deleteItemFromTaskArray,
  copyArrayDataToTarget,
} from "@/utils/index.js";
export default {
  components: {
    CommonRender,
    FormDialog,
    MatterEditDrawer,
  },
  props: {},
  data() {
    return {
      addVisible: false,
      matterVisible: false,
      matterId: "",
      currentSideBarId:""
    };
  },
  computed: {
    attrs() {
      return getConfig.call(this);
    },
    formDataKey() {
      return this.$refs.commonRender?.activeTab;
    },
  },
  mounted() {},
  methods: {
    handleAdd(currentSideBarId) {
      this.currentSideBarId = currentSideBarId;
      this.addVisible = true;
    },
    handleDelete(row) {
      deleteItemFromTaskArray(this.formDataKey, row.id, this.$db);
      this.$refs.commonRender.handleRefresh();
    },
    handleClose(type = false) {
      if (type) {
        this.$refs.commonRender.handleRefresh();
      }
      this.addVisible = false;
      this.matterVisible = false;
    },
    MatterEditDrawer(id) {
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
              "RectificationPlanNode-fill",
              "ConcentratedRectificationNode-index",
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
  },
};
</script>

<style lang="less" scoped></style>
