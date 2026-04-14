<template>
  <t-drawer
    :visible.sync="localVisible"
    :header="header"
    @close="handleClose"
    @confirm="handleConfirm"
    size="50%"
  >
    <div class="drawer-content">
      <div class="node-content__table">
        <t-table
          class="w100b"
          row-key="key"
          :data="matters"
          :columns="columns"
          size="large"
        ></t-table>
      </div>
    </div>
  </t-drawer>
</template>

<script>
import { AddIcon, CloseIcon } from "tdesign-icons-vue";
import {
  findItemInTaskArray,
  deepCopy,
  updateItemInTaskArray,
} from "@/utils/index.js";
export default {
  components: { AddIcon, CloseIcon },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
    formDataKey: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      localVisible: this.visible,
      header: "",
      formData: {},
      matters: [],
    };
  },
  watch: {
    // 父组件更新 visible 时同步到本地
    visible(newVal) {
      this.localVisible = newVal;
    },
  },
  computed: {
    columns() {
      return [
        { colKey: "serial-number", width: 80, title: "序号" },
        { colKey: "fileName", title: "文件名称" },
        { colKey: "version", title: "版本" },
        {
          title: "操作栏",
          colKey: "operate",
          width: 150,
          cell: (h, { row, rowIndex }) => {
            return h("div", { class: "table-operations" }, [
              h(
                "t-link",
                {
                  props: { theme: "danger", hover: "color" },
                  attrs: { "data-id": row.key },
                  on: {
                    click: () => {
                      this.handleDelete(rowIndex);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ];
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.formData = deepCopy(
        await findItemInTaskArray(this.formDataKey, this.id, this.$db)
      );
      this.header = this.formData.title;
      this.matters = this.formData.fileList;
    },
    handleDelete(rowIndex) {
      this.matters.splice(rowIndex, 1);
    },
    handleRemove(list, idx) {
      list.splice(idx, 1);
    },
    async handleConfirm() {
      this.formData.fileList = this.matters;
      console.log("表单验证通过，数据:", this.formData);
      // 编辑逻辑 - 使用通用工具方法更新数据
      const success = await updateItemInTaskArray(
        this.formDataKey,
        this.id,
        this.formData,
        this.$db
      );
      if (success) {
        this.$message.success("更新成功");
        this.handleClose(true);
      } else {
        this.$message.error("更新失败，请重试");
      }
    },
    handleClose(flag = false) {
      this.$emit("close", flag);
    },
  },
};
</script>

<style lang="less" scoped>
.node-content__table {
  margin-top: 16px;
  width: 100%;
  border: 1px solid #e7e7e7;

  /deep/ .t-table__th-cell-inner {
    font-weight: 600;
    color: #000;
  }
}
</style>
