<template>
  <CommonRender :attrs="attrs" ref="commonRender">
    <template #component-solt>
      <FormDialog
        v-if="addVisible"
        :visible="addVisible"
        :formDataKey="formDataKey"
        :cascaderOptions="cascaderOptions"
        @close="close"
      />
      <EditDrawer
        v-if="editVisible"
        :visible="editVisible"
        :id="rowId"
        :formDataKey="formDataKey"
        @close="close"
      />
    </template>
  </CommonRender>
</template>

<script>
import CommonRender from "../../Components/CommonRender.vue";
import FormDialog from "./FormDialog.vue";
import EditDrawer from "./EditDrawer.vue";
import { getConfig } from "./config.js";
export default {
  components: {
    CommonRender,
    FormDialog,
    EditDrawer,
  },
  props: {},
  data() {
    return {
      addVisible: false,
      cascaderOptions: [],
      editVisible: false,
      rowId: "",
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
      this.cascaderOptions = this.$refs.commonRender.innerTableData.map((o) => {
        return {
          ...o,
          label: o.title,
          value: o.id,
          children: o.fileList.map((f) => ({
            ...f,
            label: f.matter,
            value: f.matter,
          })),
        };
      });
      this.addVisible = true;
    },
    handleEdit(row) {
      this.rowId = row.id;
      this.editVisible = true;
    },
    close(type) {
      if (type == true) {
        this.$refs.commonRender.handleRefresh();
      }
      this.addVisible = false;
      this.editVisible = false;
    },
  },
};
</script>

<style lang="less" scoped></style>
