<template>
  <CommonRender :attrs="attrs" ref="commonRender">
    <template #component-solt>
      <MeasureDrawer
        :visible.sync="measureDrawerVisible"
        :id="measureDrawerId"
        type="SubsequentRectificationReportNode-fill"
        v-if="measureDrawerVisible"
        @close="closeMeasureDrawer"
      ></MeasureDrawer>
      <FormDialog
        v-if="addVisible"
        :visible="addVisible"
        :questionsSpecial="currentSideBarId"
        @close="handleClose"
      ></FormDialog>
    </template>
  </CommonRender>
</template>

<script>
import { deleteItemFromTaskArray } from "@/utils/index.js";
import CommonRender from "../../Components/CommonRender.vue";
import MeasureDrawer from "../../Components/MeasureDrawer.vue";
import FormDialog from "./FormDialog.vue";
import { getConfig } from "./config.js";
export default {
  components: {
    CommonRender,
    MeasureDrawer,
    FormDialog,
  },
  props: {},
  data() {
    return {
      measureDrawerVisible: false,
      measureDrawerId: "",
      addVisible: false,
    };
  },
  computed: {
    attrs() {
      return getConfig.call(this);
    },
    formDataKey() {
      return this.$refs.commonRender?.activeTab;
    },
    currentSideBarId() {
      return this.$refs.commonRender?.currentSideBarId;
    },
  },
  mounted() {},
  methods: {
    handleAdd() {
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
    },
    close() {
      this.matterEditDrawerVisible = false;
    },
    async openMeasureDrawer(id) {
      this.measureDrawerId = id;
      this.measureDrawerVisible = true;
    },
    closeMeasureDrawer(type = false) {
      if (type) {
        this.$refs.commonRender.handleRefresh();
      }
      this.measureDrawerVisible = false;
    },
  },
};
</script>

<style lang="less" scoped></style>
