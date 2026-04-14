<template>
  <t-drawer
    :visible.sync="localVisible"
    header="编辑"
    @close="handleClose"
    @confirm="handleConfirm"
    size="50%"
  >
    <div class="drawer-content">
      <t-form
        v-for="(item, index) in this.matters"
        :key="item.id"
        labelAlign="top"
        class="dialog-form pos-r"
      >
        <ModulerHeader :title="item.subTitle" class="dialog-form-header span2">
          <!-- <template #right>
            <t-button
              variant="outline"
              theme="primary"
              class="add"
              v-if="item.isAdd"
              @click="handleAdd(item.subsetItemList)"
              ><AddIcon slot="icon" size="16px" />加一行</t-button
            >
          </template> -->
        </ModulerHeader>
        <div
          class="dialog-form-wrapper"
          :class="{ span2: innerItem.fieldType === '1' }"
          v-for="(innerItem, innerIndex) in item.subsetItemList"
          :key="innerIndex"
        >
          <t-form-item
            class="matter-item"
            :label="innerItem.fieldName ? innerItem.fieldName : '文本'"
            v-if="innerItem.fieldType === '0'"
          >
            <!-- requiredMark -->
            <t-input v-model="innerItem.content"></t-input>
          </t-form-item>
          <t-form-item
            class="matter-item"
            :label="innerItem.fieldName ? innerItem.fieldName : '时间'"
            v-if="innerItem.fieldType === '2'"
          >
            <!-- requiredMark -->
            <t-date-range-picker
              v-model="innerItem.content"
            ></t-date-range-picker>
          </t-form-item>
          <div v-if="innerItem.fieldType === '1'" class="flex pos-r">
              <t-form-item class="matter-item file" :label="innerItem.fieldName">
                <FileComponent v-model="innerItem.fileData" />
              </t-form-item>
            </div>
        </div>
      </t-form>
    </div>
  </t-drawer>
</template>

<script>
import { AddIcon, CloseIcon } from "tdesign-icons-vue";
import FileComponent from './File.vue';
import {
  findItemInTaskArray,
  deepCopy,
  updateItemInTaskArray,
} from "@/utils/index.js";
export default {
  components: { AddIcon, CloseIcon, FileComponent },
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
  computed: {},
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.formData = deepCopy(
        await findItemInTaskArray(this.formDataKey, this.id, this.$db)
      );
      this.matters = this.formData.sub;
    },
    handleAdd(list) {
      list.push({
        fieldName: "密级",
        fieldType: "1",
        content: "",
        fileName: "",
        filePath: "",
      });
    },
    // handleRemove(list, idx) {
    //   list.splice(idx, 1);
    // },
    async handleConfirm() {
      this.formData.sub = this.matters;
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
    handleClose() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="less" scoped>
.drawer-content {
  padding: 24px;
  .dialog-form {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 16px;
    .dialog-form-wrapper {
      width: 100%;
      .matter-item {
        margin-bottom: 16px;
        width: 100%;
        &.file {
          width: 100%;
          .uploader {
            width: 100%;
          }
        }
      }
    }
    .span2 {
      grid-column: span 2;
      width: 100%;
    }
    /deep/.t-date-range-picker {
      width: 100%;
    }
  }
}
.add {
  width: 100px;
}
.close {
  right: -24px;
  top: 40px;
  cursor: pointer;
}
</style>
