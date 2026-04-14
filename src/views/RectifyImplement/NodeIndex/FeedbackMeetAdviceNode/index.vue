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
    </template>
  </CommonRender>
</template>

<script>
import CommonRender from "../../Components/CommonRender.vue";
import MatterDrawer from "../../Components/MatterDrawer.vue";
import { getConfig } from "./config.js";
export default {
  components: {
    CommonRender,
    MatterDrawer,
  },
  props: {},
  data() {
    return {
      matterVisible: false,
      matterId: "",
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
    handleOpenMatterDrawer(id = "") {
      this.matterVisible = true;
      this.matterId = id;
    },
    handleClose() {
      this.matterVisible = false;
    },
  },
};
</script>

<style lang="less" scoped></style>
