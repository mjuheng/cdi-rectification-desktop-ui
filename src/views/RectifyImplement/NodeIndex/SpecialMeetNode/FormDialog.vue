<template>
  <t-dialog :visible="visible" header="新增文件" width="880px" placement="center" :closeOnOverlayClick="false"
    :onConfirm="onConfirm" :onClose="handleClose">
    <t-form :data="formData" :rules="rules" ref="formRef" :labelAlign="'top'">
      <t-row :gutter="16">
        <t-col :span="6">
          <t-form-item label="选择事项" name="matter">
            <t-cascader v-model="formData.matter" :options="cascaderOptions" clearable @change="handleChage">
            </t-cascader>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="版本" name="version">
            <t-select v-model="formData.version" :options="versionList" placeholder="请选择"></t-select>
          </t-form-item>
        </t-col>
      </t-row>
      <t-row :gutter="16" class="mgt16">
        <t-col :span="6">
          <t-form-item label="参会人员">
            <t-input v-model="formData.userName"></t-input>
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item label="会议时间">
            <t-date-picker class="w100b" v-model="formData.time"></t-date-picker>
          </t-form-item>
        </t-col>
      </t-row>
      <t-row :gutter="16" class="mgt16">
        <t-col :span="6">
          <t-form-item label="地点">
            <t-input v-model="formData.address"></t-input>
          </t-form-item>
        </t-col>
      </t-row>
        <t-form-item label="添加文件" class="mgt16">
          <FileComponent v-model="formData.fileData" :unuseAddBtn="false" />
        </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script>
import { updateItemInTaskArray } from "@/utils/index.js";
import FileComponent from "@/views/RectifyImplement/Components/File.vue";
export default {
  components: {
    FileComponent
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    cascaderOptions: Array,
    formDataKey: String,
  },
  data() {
    return {
      formData: {
        matter: "",
        version: "",
        userName: "",
        time: "",
        address: "",
        mj: "",
        fileData: [
          {
            fileType: "",
            fileName: "",
            filePath: ""
          }
        ]
      },
      rules: {
        matter: [{ required: true, message: "请选择事项" }],
        version: [{ required: true, message: "请选择版本" }],
      },
      tableData: {},
    };
  },
  computed: {
    versionList() {
      let arr = [];
      for (let index = 1; index <= 3; index++) {
        arr.push({
          label: `第${index}版`,
          value: `第${index}版`,
        });
      }
      return arr;
    },
  },
  mounted() { },
  methods: {
    handleChage(val, context) {
      if (context) {
        const paths = context.node.getPath();
        this.tableData = paths[0].data;
      }
    },
    async onConfirm() {
      const res = await this.$refs.formRef.validate();
      if (res !== true) return;

      // 验证是否有有效的文件数据
      const validFiles = this.formData.fileData.filter(file =>
        file.fileName && file.filePath && file.fileType
      );

      if (validFiles.length === 0) {
        this.$message.error("请至少上传一个文件");
        return;
      }

      this.tableData.fileList = this.tableData.fileList.map((o) => {
        if (this.formData.matter == o.matter) {
          // 为每个有效文件创建一个新的表单数据对象
          validFiles.forEach(file => {
            o.files.push({
              matter: this.formData.matter,
              version: this.formData.version,
              userName: this.formData.userName,
              time: this.formData.time,
              address: this.formData.address,
              mj: file.fileType, // 使用文件组件中的fileType作为密级
              fileName: file.fileName,
              filePath: file.filePath
            });
          });
        }
        return o;
      });
      await updateItemInTaskArray(
        this.formDataKey,
        this.tableData.id,
        this.tableData,
        this.$db
      );
      this.$message.success("更新成功");
      this.handleClose(true);
    },
    handleClose(flag = false) {
      this.$emit("close", flag);
    },
  },
};
</script>
<style lang="less" scoped>
/deep/ .t-dialog__body {
  overflow-x: hidden;
}
</style>
