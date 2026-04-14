<template>
  <t-dialog :visible="visible" header="新增文件" width="880px" placement="center" :closeOnOverlayClick="false"
    :onConfirm="onConfirm" :onClose="close">
    <t-form :data="formData" :rules="rules" ref="formRef" :labelAlign="'top'">
      <t-form-item label="版本" name="version">
        <t-select v-model="formData.version" :options="versionList" placeholder="请选择"></t-select>
      </t-form-item>
      <t-form-item label="请上传Word与Pdf">
        <FileComponent v-model="formData.fileData" :unuseAddBtn="true" />
      </t-form-item>
      <div class="upload-tip">
        <t-icon name="info-circle" /> 请至少上传Word或PDF版本中的一个文件
      </div>
    </t-form>
  </t-dialog>
</template>

<script>
import { addItemToTaskArray } from "@/utils/index.js";
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
    currentSideBarId:{
      type: String,
      default: ""
    }
  },
  data() {
    return {
      formData: {
        version: "",
        fileData: [
          {
            fileType: "",
            fileName: "",
            filePath: ""
          },
          {
            fileType: "",
            fileName: "",
            filePath: ""
          },
        ]
      },
      rules: {
        version: [{ required: true, message: "请选择版本" }],
      },
      unitList: [],
      versionList:[{
        label: `第1版`,
        value: `第1版`,
      }]
    };
  },
  // computed: {
  //   versionList() {
  //     let arr = [];
  //     for (let index = 1; index <= 10; index++) {
  //       arr.push({
  //         label: `第${index}版`,
  //         value: `第${index}版`,
  //       });
  //     }
  //     console.log(arr,"arr");
  //     return arr;
  //   },
  // },
  async mounted() { },
  methods: {
    async onConfirm() {
      const res = await this.$refs.formRef.validate();
      if (res !== true) return;

      // 验证是否有有效的文件数据
      const validFiles = this.formData.fileData.filter(file =>
        file.fileName && file.filePath && file.fileType
      );

      if (validFiles.length === 0) {
        this.$message.error("请至少上传一个文件（Word或PDF版本）");
        return;
      }

      // 处理每个上传的文件
      validFiles.forEach(file => {
        this.handleSetData(file);
      });

      this.close(true);
    },
    handleSetData(file) {
      addItemToTaskArray(
        "RectificationPlanNode-scheme",
        {
          fileName: file.fileName,
          fileType: file.fileType,
          filePath: file.filePath,
          version: this.formData.version,
          questionsSpecial:this.currentSideBarId,
        },
        this.$db
      );
    },
    close(flag = false) {
      this.$emit("close", flag);
    },
  },
};
</script>
<style lang="less" scoped>
.upload-tip {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.upload-tip :deep(.t-icon) {
  font-size: 16px;
}
</style>
