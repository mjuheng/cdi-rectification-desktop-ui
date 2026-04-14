<template>
  <CommonRender :attrs="attrs" ref="commonRender">
    <template #component-solt>
      <MeasureDrawer
        :visible.sync="measureDrawerVisible"
        :id="rowId"
        type="PublicRectificationSituationNode-unpublished"
        :visibleType="rowType"
        :currentTab="currentTab"
        v-if="measureDrawerVisible"
        @close="handleClose"
      ></MeasureDrawer>
      <FileTableDrawer
        v-if="fileTableVisible"
        :visible="fileTableVisible"
        :currentTab="currentTab"
        @close="handleClose"
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
import PublicItemTableDrawer from "../../Components/PublicItemTableDrawer.vue";
import FileTableDrawer from "../../Components/FileTableDrawer.vue";
import FormDialog from "./FormDialog.vue";
import EditDrawer from "./EditDrawer.vue";
import { getConfig } from "./config.js";
import { copyArrayDataToTarget } from "@/utils/index.js";
export default {
  components: {
    CommonRender,
    MeasureDrawer,
    PublicItemTableDrawer,
    FileTableDrawer,
    FormDialog,
    EditDrawer,
  },
  props: {},
  data() {
    return {
      measureDrawerVisible: false,
      publishItemTabVisible: false,
      fileTableVisible: false,
      addVisible: false,
      matterOptions: [],
      editVisible: false,
      rowId: "",
      rowType: "",
    };
  },
  computed: {
    attrs() {
      return getConfig.call(this);
    },
    formDataKey() {
      return this.$refs.commonRender?.activeTab;
    },
    currentTab() {
      return this.$refs.commonRender?.currentSubActiveTab;
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
    handleClose(type) {
      if (type == true) {
        this.$refs.commonRender.handleRefresh();
      }
      this.addVisible = false;
      this.editVisible = false;
      this.measureDrawerVisible = false;
      this.fileTableVisible = false;
    },
    handlePublishItemClose() {
      this.publishItemTabVisible = false;
    },
    close() {
      this.fileTableVisible = false;
    },
    async handleAddUnpublished() {
      this.fileTableVisible = true;
    },
    async openMeasureDrawer(type, id) {
      this.rowId = id;
      this.rowType = type;
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
              "PublicRectificationSituationNode-unpublished",
              "SubsequentRectificationNode-fill",
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
