<template>
  <CommonRender :attrs="attrs" ref="commonRender">
    <template #component-solt>
      <MeasureDrawer
        :visible.sync="measureDrawerVisible"
        :id="measureDrawerId"
        type="ConcentratedRectificationNode-index"
        v-if="measureDrawerVisible"
        @close="closeMeasureDrawer"
      ></MeasureDrawer>
    </template>
  </CommonRender>
</template>

<script>
import CommonRender from "../../Components/CommonRender.vue";
import MeasureDrawer from "../../Components/MeasureDrawer.vue";
import { getConfig } from "./config.js";
import {copyArrayDataToTarget} from "@/utils/index.js";
export default {
  components: {
    CommonRender,
    MeasureDrawer,
  },
  props: {},
  data() {
    return {
      measureDrawerVisible: false,
      measureDrawerId: "",
    };
  },
  computed: {
    attrs() {
      return getConfig.call(this);
    },
  },
  mounted() {},
  methods: {
    closeMeasureDrawer(type = false) {
      if (type) {
        this.$refs.commonRender.handleRefresh();
      }
      this.measureDrawerVisible = false;
    },
    async openMeasureDrawer(id) {
      this.measureDrawerId = id;
      this.measureDrawerVisible = true;
    },
    handleSave() {
      let mydialog = this.$dialog({
        header: "保存",
        body: "确认保存数据内容？(确认后，该环节相关数据将自动带入后续环节。若后续环节已有数据，保存后将覆盖后续环节已有数据。)",
        onConfirm: async ({ e }) => {
          try {
            // 使用通用方法将FeedbackMeetNode-problemList数据复制到RectificationPlanNode-fill
            const success = await copyArrayDataToTarget(
              "ConcentratedRectificationNode-index",
              "RectificationReportNode-fill",
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
