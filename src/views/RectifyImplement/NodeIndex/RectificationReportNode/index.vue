<template>
  <CommonRender :attrs="attrs" ref="commonRender">
    <template #component-solt>
      <MeasureDrawer
        :visible.sync="measureDrawerVisible"
        :id="measureDrawerId"
        type="RectificationReportNode-fill"
        v-if="measureDrawerVisible"
        @close="handleClose"
      ></MeasureDrawer>
      <FileTableDrawer
        :visible.sync="fileTableVisible"
        @close="closeFileTableDrawer"
      ></FileTableDrawer>
      <FormDialog
        v-if="addVisible"
        :visible="addVisible"
        :formDataKey="formDataKey"
        :matterOptions="matterOptions"
        @close="handleClose"
      ></FormDialog>
      <EditDrawer
        v-if="editVisible"
        :visible="editVisible"
        :id="rowId"
        :formDataKey="formDataKey"
        @close="handleClose"
      />
    </template>
  </CommonRender>
</template>

<script>
import CommonRender from "../../Components/CommonRender.vue";
import MeasureDrawer from "../../Components/MeasureDrawer.vue";
import FileTableDrawer from "../../Components/FileTableDrawer.vue";
import FormDialog from "./FormDialog.vue";
import EditDrawer from "./EditDrawer.vue";
import { copyArrayDataToTarget } from "@/utils/index.js";
import { getConfig } from "./config.js";
export default {
  components: {
    CommonRender,
    MeasureDrawer,
    FileTableDrawer,
    FormDialog,
    EditDrawer,
  },
  props: {},
  data() {
    return {
      measureDrawerVisible: false,
      fileTableVisible: false,
      addVisible: false,
      matterOptions: [],
      editVisible: false,
      rowId: "",
      measureDrawerId: "",
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
    handleAdd() {
      this.matterOptions = this.$refs.commonRender.innerTableData.map((o) => {
        return {
          ...o,
          label: o.title,
          value: o.id,
        };
      });
      this.addVisible = true;
    },
    handleEdit(row) {
      this.rowId = row.id;
      this.editVisible = true;
    },
    closeFileTableDrawer() {
      this.fileTableVisible = false;
    },
    handleClose(type) {
      if (type == true) {
        this.$refs.commonRender.handleRefresh();
      }
      this.addVisible = false;
      this.editVisible = false;
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
              "RectificationReportNode-fill",
              "PublicRectificationSituationNode-unpublished",
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
