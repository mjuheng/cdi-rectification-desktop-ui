<template>
  <t-drawer
    :size="visibleType === 'check-unpublish' ? '1460px' : '960px'"
    :visible="visible"
    :closeBtn="true"
    header="编辑"
    closeOnOverlayClick
    destroyOnClose
    @close="onClose"
    confirmBtn="保存"
    :onConfirm="handleSubmit"
    :footer="header === '编辑' ? true : false"
  >
    <div class="drawer-wrapper">
      <div class="drawer-content main">
        <div class="detail-component">
          <ModulerHeader title="问题详情" class="mgb16" />
          <div class="measure-img" v-if="formData.focusConcern === '是'"></div>
          <t-form
            ref="viewFormRef"
            layout="inline"
            class="common-form grid2"
            labelAlign="left"
            labelWidth="140px"
            :data="formData"
          >
            <t-form-item
              v-for="item in formItems"
              :key="item.name"
              v-bind="item"
              :class="item.class ? item.class : ''"
            >
              <t-tooltip :content="item.cell ? item.cell : formData[item.name]">
                {{ item.cell ? item.cell : formData[item.name] }}
              </t-tooltip>
            </t-form-item>
          </t-form>
        </div>
        <div class="detail-component">
          <ModulerHeader title="问题完成情况" class="mgb16" />
          <t-form
            ref="editFormRef"
            layout="inline"
            class="common-form grid3"
            labelAlign="top"
            :data="formData"
          >
            <t-form-item
              v-for="item in editItems"
              :key="item.name"
              v-bind="item"
              :class="item.class ? item.class : ''"
            >
              <component
                class="dynamic-form-item"
                :is="item.type"
                v-bind="item.attrs"
                v-model="formData[item.name]"
              ></component>
            </t-form-item>
          </t-form>
        </div>
        <div class="detail-component">
          <ModulerHeader title="措施完成情况" class="mgb16" />
          <RectifyMeasuresEdit
            ref="RectifyMeasuresEdit"
            :measures.sync="measureList"
            :completeTime="formData.completeTime"
            @onMeasureSave="handleMeasureItemSave"
            :isView="header === '查看' ? true : false"
          />
          <div class="line-btn" v-if="header === '编辑' && isAddDeleteMeasure">
            <div class="add-btn" @click="handleEditMeasure">编辑/添加措施</div>
          </div>
        </div>
      </div>
      <div class="drawer-content-right" v-if="visibleType == 'check-unpublish'">
        <div class="drawe-content-right_flow">
          <t-form
            ref="unpublishFormRef"
            layout="inline"
            class="common-form grid3"
            labelAlign="top"
            :data="unpublishFormData"
          >
            <t-form-item
              v-for="item in undefinedItems"
              :key="item.name"
              v-bind="item"
              :class="item.class ? item.class : ''"
            >
              <component
                class="dynamic-form-item"
                :is="item.type"
                v-bind="item.attrs"
                v-model="unpublishFormData[item.name]"
              ></component>
            </t-form-item>
          </t-form>
          <div class="drawe-content-right-btns">
            <t-button @click="handleSavePublish">保存</t-button>
          </div>
        </div>
      </div>
    </div>
  </t-drawer>
</template>

<script>
import {
  CHECKABLE_NODES,
  HIDDEN_HISTORY_CHECK_NODES,
  NODE_CODE_MAP,
} from "../utils/constant";
import MatterCard from "./MatterCard.vue";
import {
  defaultRules,
  findItemInTaskArray,
  deepCopy,
  updateItemInTaskArray,
  addItemToTaskArray,
} from "@/utils/index.js";
import RectifyMeasuresEdit from "./RectifyMeasuresEdit.vue";
export default {
  components: { MatterCard, RectifyMeasuresEdit },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
    visibleType: {
      type: String,
      default: "edit",
    },
    currentTab: {
      type: String,
      default: "",
    },

    // attrs: {
    //   type: Object,
    //   default: () => (),
    // },
  },
  data() {
    return {
      formData: {},
      perfectForm: {
        id: "",
        perfectComments: "",
        perfectMeasures: 0,
      },
      measureList: [],
      unpublishFormData: {},
    };
  },
  computed: {
    header() {
      return this.visibleType === "edit" ? "编辑" : "查看";
    },
    // 是否显示新增删除措施
    isAddDeleteMeasure() {
      return (
        this.type === "SubsequentRectificationNode-fill" ||
        this.type === "SubsequentRectificationReportNode-fill"
      );
    },

    formItems() {
      const person = this.innerPerson(this.formData);
      return [
        { label: "具体表现:", name: "performanceContent" },
        { label: "整改专项:", name: "questionsSpecial" },
        { label: "是否重点关注:", name: "focusConcern" },
        { label: "重点关注情形:", name: "focusSituation" },
        { label: "整改落实目标:", name: "rectifyGoal", class: "span2" },
        {
          label: "责任领导:",
          name: "leaderList",
          cell: person,
          class: "span2",
        },
        { label: "责任单位:", name: "responsibleDepartment", class: "span2" },

        {
          label: "是否常态化坚持:",
          name: "oftenInsist",
        },
        {
          label: "是否集中整改期完成:",
          name: "concentratedRectification",
        },
        {
          label: "预计完成时间:",
          name: "completeTime",
        },
      ];
    },
    editItems() {
      return [
        {
          type: "t-radio-group",
          label: "具体问题整改完成情况",
          name: "completeSituation",
          class: "span3",
          attrs: {
            disabled: this.header === "查看" || this.header === "完善措施",
            options: [
              { label: "未完成", value: "未完成" },
              { label: "基本完成", value: "基本完成" },
              { label: "已完成", value: "已完成" },
            ],
          },
          rules: [
            {
              required:
                this.header === "查看" || this.header === "完善措施"
                  ? false
                  : true,
              trigger: "change",
              message: `请选择是否常态化坚持`,
            },
          ],
        },
        {
          type: "t-textarea",
          label: "问题完成情况概述",
          name: "problemCompletionOverview",
          class: "span3",
          attrs: {
            disabled: this.header === "查看" || this.header === "完善措施",
          },
          rules: [
            {
              required:
                this.header === "查看" || this.header === "完善措施"
                  ? false
                  : true,
              trigger: "bluer",
              message: `请输入问题完成情况概述`,
            },
          ],
        },
      ];
    },
    undefinedItems() {
      return [
        {
          type: "t-textarea",
          label: "具体问题（拟不公开）",
          name: "issueNoPublic",
          class: "span3",
          // attrs: {
          //   disabled: this.header === "查看",
          // },
          rules: [
            {
              required: true,
              trigger: "bluer",
              message: `请输入问题完成情况概述`,
            },
          ],
        },
        {
          type: "t-textarea",
          label: "拟不公开理由",
          name: "issueNoPublicReason",
          class: "span3",
          // attrs: {
          //   disabled: this.header === "查看",
          // },
          rules: [
            {
              required: true,
              trigger: "bluer",
              message: `请输入问题完成情况概述`,
            },
          ],
        },
        {
          type: "t-textarea",
          label: "具体问题整改落实情况（拟不公开）",
          name: "issueRectificationNoPublic",
          class: "span3",
          // attrs: {
          //   disabled: this.header === "查看",
          // },
          rules: [
            {
              required: true,
              trigger: "bluer",
              message: `请输入问题完成情况概述`,
            },
          ],
        },
        {
          type: "t-textarea",
          label: "拟不公开理由",
          name: "issueRectificationNoPublicReason",
          class: "span3",
          // attrs: {
          //   disabled: this.header === "查看",
          // },
          rules: [
            {
              required: true,
              trigger: "bluer",
              message: `请输入问题完成情况概述`,
            },
          ],
        },
      ];
    },
    unpublishForKey() {
      console.log("这边卡住了");
      return this.currentTab === "拟不在党内公开"
        ? "OrgUnpublishMap"
        : "SocietyUnpublishMap";
    },
  },
  watch: {},
  methods: {
    async init() {
      const data = deepCopy(
        await findItemInTaskArray(this.type, this.id, this.$db)
      );
      console.log("进来了");
      this.formData = data;
      if (this.visibleType === "check-unpublish") {
        this.unpublishFormData = data[this.unpublishForKey] || {};
      }
      this.measureList = this.formData.measureList || [];
      this.measureList.forEach((data) => {
        this.updateMeasureTypes(data);
      });
    },
    onClose(refresh) {
      this.measureList = [];
      this.perfectForm = {
        id: "",
        perfectComments: "",
        perfectMeasures: 0,
      };
      this.formData = {};
      this.$emit("close");
    },
    // 新增方法：更新measureType数组
    updateMeasureTypes(data) {
      const checkKeys = [
        "establishSystem",
        "recoverLoss",
        "accountability",
        "drawInferences",
        "specialRectification",
        "significantMeasures",
      ];
      this.$set(data, "measureType", []);
      checkKeys.forEach((key) => {
        if (data[key] === 1) {
          data.measureType.push(key);
        }
      });
    },
    handleMeasureItemSave(data) {
      this.measureList = data;
      const str = data
        .map((item, index) => `措施内容${index + 1}. ${item.completeContent}`)
        .join("; ");
      this.$set(this.formData, "problemCompletionOverview", str);
    },
    async handleSubmit() {
      const data = await this.$refs.RectifyMeasuresEdit.handleValidate();
      const result = await this.$refs.editFormRef.validate();

      if (result && data) {
        const params = {
          ...this.formData,
          measureList: this.measureList,
        };
        const res = await updateItemInTaskArray(
          this.type,
          this.id,
          params,
          this.$db
        );
        if (res) {
          this.$message.success("修改成功");
          this.$emit("close", true);
        }
      }
    },
    // 处理是否完善整改措施
    async handleIsNeedPerfect() {
      this.perfectForm.id = this.formData.id;
      this.$message.success("保存成功");
      this.onClose();
    },
    handleEditMeasure() {
      const checkKeys = [
        "establishSystem",
        "recoverLoss",
        "accountability",
        "drawInferences",
        "specialRectification",
        "significantMeasures",
      ];

      this.measureList.push({
        measuresContent: "",
        responsibleDepartmentId: "",
        responsiblePerson: "",
        completeContent: "",
        leadLeader: "",
        leaderList: [],
        partyOrgMainPerson: "",
        leadershipTeam: "",
        cutoffTime: "",
        establishSystem: 0,
        recoverLoss: 0,
        accountability: 0,
        drawInferences: 0,
        specialRectification: 0,
        significantMeasures: 0,
        measureType: [],
        establishSystemContent: 0,
        recoverLossContent: 0,
        accountabilityContent: 0,
        drawInferencesContent: 0,
        specialRectificationContent: 0,
        isLoaclAdd: true,
        filesMap: {
          completeContent: [],
          establishSystemContent: [],
          recoverLossContent: [],
          accountabilityContent: [],
          drawInferencesContent: [],
          specialRectificationContent: [],
        },
      });
      this.measureList.forEach((data) => {
        this.updateMeasureTypes(data);
      });
    },
    innerPerson(item) {
      // 如果item有leaderList且不为空，显示leaderList中的责任领导信息
      if (
        item.leaderList &&
        Array.isArray(item.leaderList) &&
        item.leaderList.length > 0
      ) {
        // 将leaderList中每一项的responsibleLeader和responsibleLeaderType用逗号隔开
        return (
          item.leaderList
            .map((person) => {
              if (person.responsibleLeader && person.responsibleLeaderType) {
                return `${person.responsibleLeader}(${person.responsibleLeaderType})`;
              } else if (person.responsibleLeader) {
                return person.responsibleLeader;
              } else {
                return "";
              }
            })
            .filter((str) => str !== "")
            .join("，") || "--"
        );
      }
      // 如果没有leaderList或leaderList为空，显示默认的责任人信息
      return item.responsiblePerson || "--";
    },
    handleSavePublish() {
      this.$refs.unpublishFormRef.validate().then((valid) => {
        if (valid) {
          this.$set(
            this.formData,
            this.unpublishForKey,
            this.unpublishFormData
          );
          this.handleSubmit();
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="less" scoped>
/deep/ .t-drawer__body {
  padding: 16px 36px;
  display: flex;
  flex-direction: column;
  .drawer-wrapper {
    // flex: 1;
    display: flex;
    height: 100%;
    width: 100%;
    .drawer-content {
      width: 960px;
      .detail-component {
        position: relative;
        .measure-img {
          position: absolute;
          top: 0;
          right: 0;
          width: 74px;
          height: 74px;
          background: url("../images/follow.png") no-repeat;
        }
      }
    }
    .common-form {
      display: grid;
      height: 100%;
      width: 100%;
      &.grid2 {
        grid-template-columns: 1fr 1fr;
      }
      &.grid3 {
        grid-template-columns: 1fr 1fr 1fr;
      }
      .span3 {
        grid-column: span 3;
      }
      .span2 {
        grid-column: span 2;
      }
    }
    .drawe-content-right_flow {
      width: 600px;
      max-height: 100%;
      border-left: 1px solid #e7e7e7;
      margin-left: 16px;
      padding: 0px 16px;
    }
  }
  .line-btn {
    display: flex;
    justify-content: center;
    margin: 16px 0px;

    .add-btn {
      padding: 8px 16px;
      // background-color: #2d8cf0;
      color: #2d8cf0;
      border: 1px solid #2d8cf0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
      display: inline-flex;
      align-items: center;

      &:hover {
        background-color: #57a3f3;
        box-shadow: 0 2px 6px rgba(45, 140, 240, 0.3);
        color: #fff;
      }

      &:active {
        background-color: #1a7de9;
      }
    }
  }
  .measure-wrapper {
    width: 100%;
    .measure-item {
      border-bottom: 1px solid #e7e7e7;
      position: relative;
      padding: 16px 0;
      .item-close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
      }
    }
  }
}
/deep/.t-date-picker {
  width: 100% !important;
}
/deep/.dynamic-form-item {
  width: 100% !important;
}
</style>
