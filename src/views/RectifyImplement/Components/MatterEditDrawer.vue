<template>
  <t-drawer
    size="960px"
    :visible="visible"
    :closeBtn="true"
    header="编辑"
    closeOnOverlayClick
    destroyOnClose
    @close="onClose"
    confirmBtn="保存"
    :onConfirm="handleSubmit"
  >
    <div class="drawer-wrapper">
      <div class="drawer-content main" v-if="!isMeasure">
        <div class="detail-component">
          <ModulerHeader title="问题详情" class="mgb16" />
          <div class="measure-img" v-if="formData.focusConcern === 1"></div>
          <t-form
            ref="viewFormRef"
            layout="inline"
            class="common-form grid2"
            labelAlign="left"
            :data="formData"
          >
            <t-form-item
              v-for="item in formItems"
              :key="item.name"
              v-bind="item"
              :class="item.class ? item.class : ''"
            >
              <t-tooltip
                :content="
                  item.cell
                    ? item.cell[formData[item.name]]
                    : formData[item.name]
                "
              >
                {{
                  item.cell
                    ? item.cell[formData[item.name]]
                    : formData[item.name]
                }}
              </t-tooltip>
            </t-form-item>
          </t-form>
        </div>
        <div class="detail-component">
          <ModulerHeader title="编辑问题" class="mgb16" />
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
              :requiredMark="item.requiredMark"
            >
              <component
                class="dynamic-form-item"
                :is="item.type"
                v-bind="item.attrs"
                v-model="formData[item.name]"
              >
              </component>
            </t-form-item>
          </t-form>
        </div>
        <div class="detail-component">
          <ModulerHeader title="整改措施" class="mgb16" />
          <rectify-measures :measures="measureList" />
          <div class="line-btn">
            <div class="add-btn" @click="handleEditMeasure">编辑/添加措施</div>
          </div>
        </div>
      </div>
      <div class="drawer-content measure" v-else>
        <ModulerHeader title="整改措施" class="mgb16" />
        <div class="measure-wrapper">
          <div
            class="measure-item"
            v-for="(item, index) in measureList"
            :key="index"
          >
            <CloseCircleIcon
              v-if="index != 0"
              color="#e37318"
              name="t-close-circle"
              size="24px"
              class="item-close-btn"
              @click="handleDeleteMeasure(index)"
            ></CloseCircleIcon>
            <t-form
              ref="measureFormRef"
              layout="inline"
              class="common-form grid3"
              labelAlign="top"
              :data="measureList[index]"
            >
              <t-form-item
                v-for="item in measureItems"
                :key="item.name"
                v-bind="item"
                :class="item.class ? item.class : ''"
              >
                <component
                  class="dynamic-form-item"
                  :is="item.type"
                  v-bind="item.attrs(index)"
                  v-model="measureList[index][item.name]"
                ></component>
              </t-form-item>
            </t-form>
          </div>
          <div class="line-btn">
            <div class="add-btn" @click="handleAddMeasure">添加措施</div>
          </div>
        </div>
      </div>
    </div>
  </t-drawer>
</template>

<script>
import MatterCard from "./MatterCard.vue";
import RectifyMeasures from "./RectifyMeasures.vue";
import AddPerson from "./AddPerson.vue";
import { CloseCircleIcon } from "tdesign-icons-vue";
import {
  defaultRules,
  findItemInTaskArray,
  deepCopy,
  updateItemInTaskArray,
  addItemToTaskArray,
} from "@/utils/index.js";
export default {
  components: { MatterCard, RectifyMeasures, CloseCircleIcon, AddPerson },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      taskId: "",
      formData: {},
      isMeasure: false,
      measureList: [],
    };
  },
  computed: {
    formItems() {
      return [
        { label: "具体表现:", name: "performanceContent" },
        { label: "整改巡视专项:", name: "questionsSpecial" },
        { label: "是否重点关注:", name: "focusConcern" },
        { label: "重点关注情形:", name: "focusSituation" },
      ];
    },
    editItems() {
      return [
        {
          type: "t-textarea",
          label: "整改落实目标",
          name: "rectifyGoal",
          class: "span3",
          attrs: {
            disabled: false,
          },
          rules: [
            {
              required: true,
              trigger: "bluer",
              message: `请输入整改落实目标`,
            },
          ],
        },
        {
          type: "AddPerson",
          label: "责任领导",
          name: "leaderList",
          class: "span3",
          // requiredMark: true,
          attrs: {
            disabled: false,
          },
          rules: [
            {
              required: true,
              trigger: "bluer",
              message: `请输入责任领导`,
            },
          ],
        },
        {
          type: "t-input",
          label: "责任单位",
          name: "responsibleDepartment",
          class: "span3",
          attrs: {
            disabled: false,
          },
        },
        {
          type: "t-radio-group",
          label: "是否常态化坚持",
          name: "oftenInsist",
          attrs: {
            disabled: false,
            options: [
              { label: "是", value: "是" },
              { label: "否", value: "否" },
            ],
          },
          rules: [
            {
              required: true,
              trigger: "change",
              message: `请选择是否常态化坚持`,
            },
          ],
        },
        {
          type: "t-radio-group",
          label: "是否集中整改期完成",
          name: "concentratedRectification",
          attrs: {
            disabled: false,
            options: [
              { label: "是", value: "是" },
              { label: "否", value: "否" },
            ],
          },
          rules: [
            {
              required: true,
              trigger: "change",
              message: `请选择是否集中整改期完成`,
            },
          ],
        },
        {
          type: "t-date-picker",
          label: `预计完成时间${
            this.formData.concentratedRectification === 0 ? "(长期任务)" : ""
          }`,
          name: "completeTime",
          attrs: {
            disabled: false,
          },
          rules: [
            {
              required: true,
              trigger: "change",
              message: `请选择完成时间`,
            },
          ],
        },
      ];
    },
    measureItems() {
      return [
        {
          type: "t-textarea",
          label: "措施内容",
          name: "measuresContent",
          class: "span3",
          attrs: () => {
            return {
              disabled: false,
            };
          },
          rules: [
            {
              required: true,
              trigger: "bluer",
              message: `请输入措施内容`,
            },
          ],
        },
        {
          type: "AddPerson",
          label: "责任领导",
          name: "leaderList",
          class: "span3",
          attrs: () => {
            return {
              disabled: false,
            };
          },
          rules: [
            {
              required: true,
              trigger: "bluer",
              message: `请输入责任领导`,
            },
          ],
        },
        {
          type: "t-input",
          label: "责任单位",
          name: "responsibleDepartment",
          attrs: () => {
            return {
              disabled: false,
            };
          },
        },
        // {
        //   type: "t-input",
        //   label: "责任人",
        //   name: "responsiblePerson",
        //   attrs: () => {
        //     return {
        //       disabled: false,
        //     };
        //   },
        //   rules: [
        //     {
        //       required: true,
        //       trigger: "change",
        //       message: `请输入责任人`,
        //     },
        //   ],
        // },
        // {
        //   type: "t-input",
        //   label: "牵头领导",
        //   name: "leadLeader",
        //   attrs: () => {
        //     return {
        //       disabled: false,
        //     };
        //   },
        //   rules: [
        //     {
        //       required: true,
        //       trigger: "bluer",
        //       message: `请输入牵头领导`,
        //     },
        //   ],
        // },
        // {
        //   type: "t-input",
        //   label: "党组织主要责任人",
        //   name: "partyOrgMainPerson",
        //   attrs: () => {
        //     return {
        //       disabled: false,
        //     };
        //   },
        // },
        // {
        //   type: "t-input",
        //   label: "领导班子成员",
        //   name: "leadershipTeam",
        //   attrs: () => {
        //     return {
        //       disabled: false,
        //     };
        //   },
        // },
        {
          type: "t-date-picker",
          label: "预计完成时间",
          name: "cutoffTime",
          attrs: () => {
            return {
              disabled: false,
              // disableDate: (val) => {
              //   return new Date(val) > new Date(this.formData.completeTime);
              // },
            };
          },
          rules: [
            {
              required: true,
              trigger: "change",
              message: `请选择完成时间`,
            },
          ],
        },
        {
          type: "t-checkbox-group",
          label: "措施类型",
          name: "measureType",
          class: "span3",
          attrs: (index) => {
            return {
              disabled: false,
              options: [
                { label: "建章立制", value: "establishSystem" },
                { label: "挽回损失", value: "recoverLoss" },
                { label: "追责问责", value: "accountability" },
                { label: "举一反三", value: "drawInferences" },
                { label: "是否专项整治", value: "specialRectification" },
                { label: "重大措施", value: "significantMeasures" },
              ],
              // onChange: (context) => {
              //   console.log(index, context, "sss");
              //   this.$set(this.measureList[index], "measureType", context);
              //   // this.measureList[index].measureType = context;
              // },
            };
          },
          rules: [
            {
              required: true,
              trigger: "change",
              message: `请选择措施类型`,
            },
          ],
        },
      ];
    },
  },
  watch: {},
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      const data = deepCopy(
        await findItemInTaskArray(
          "RectificationPlanNode-fill",
          this.id,
          this.$db
        )
      );
      this.formData = data;

      // 确保leaderList字段存在且为数组格式
      if (
        !this.formData.leaderList ||
        !Array.isArray(this.formData.leaderList)
      ) {
        this.$set(this.formData, "leaderList", []);
      }

      console.log(this.formData, "this.formData");
      this.measureList = this.formData.measureList ?? [];
      this.measureList.forEach((data) => {
        this.updateMeasureTypes(data);
      });
    },
    onClose(refresh) {
      if (this.isMeasure) {
        this.isMeasure = false;
      } else {
        this.measureList = [];
        this.isMeasure = false;
        this.$emit("update:visible", false);
      }
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
      if (!this.measureList.length) {
        this.measureList.push({
          measuresContent: "",
          responsibleDepartment: "",
          leaderList: [],
          cutoffTime: "",
          establishSystem: 0,
          recoverLoss: 0,
          accountability: 0,
          drawInferences: 0,
          specialRectification: 0,
          significantMeasures: 0,
          measureType: [],
        });
      } else {
        this.measureList.forEach((data) => {
          this.updateMeasureTypes(data);
        });
      }
      this.isMeasure = true;
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
    async handleAddMeasure() {
      const validateResults = await Promise.all(
        this.$refs.measureFormRef.map((form) => form.validate())
      );
      console.log(validateResults, "validateResults");
      if (validateResults.every((valid) => valid == true)) {
        this.measureList.push({
          measuresContent: "",
          responsibleDepartment: "",
          cutoffTime: "",
          establishSystem: 0,
          recoverLoss: 0,
          accountability: 0,
          drawInferences: 0,
          specialRectification: 0,
          significantMeasures: 0,
          measureType: [],
        });
      } else {
        this.$message.error("请完整填写措施");
      }
    },
    handleDeleteMeasure(index) {
      // 确保索引在有效范围内
      if (index >= 0 && index < this.measureList.length) {
        // 使用splice方法删除指定位置的元素
        this.measureList.splice(index, 1);
        // 可选：显示删除成功的提示
        this.$message.success("删除措施成功");
      } else {
        // 可选：显示索引无效的提示
        this.$message.warning("无效的索引位置");
      }
    },
    async handleSubmit() {
      if (this.isMeasure) {
        const validateResults = await Promise.all(
          this.$refs.measureFormRef.map((form) => form.validate())
        );
        if (validateResults.every((valid) => valid == true)) {
          const checkKeys = [
            "establishSystem",
            "recoverLoss",
            "accountability",
            "drawInferences",
            "specialRectification",
            "significantMeasures",
          ];
          this.measureList.forEach((item, index) => {
            item.measureType.forEach((key) => {
              // 首先将所有字段重置为0
              checkKeys.forEach((key) => {
                item[key] = 0;
              });
              // 然后将measureType中存在的字段设置为1
              item.measureType.forEach((key) => {
                if (key in item) {
                  item[key] = 1;
                }
              });
            });
          });
          this.isMeasure = false;
        } else {
          return this.$message.error("请完善措施");
        }
      } else {
        const result = await this.$refs.editFormRef.validate();
        console.log(result, "res");
        if (result === true) {
          // if (!this.formData.leaderList.length || !this.formData.leaderList[0]?.responsibleLeader) {
          //   console.log(this.formData,'formDarta');
          //   return this.$message.error("请输入责任领导");
          // }
          const params = {
            ...this.formData,
            measureList: this.measureList,
          };
          console.log(params, "params");
          const success = await updateItemInTaskArray(
            "RectificationPlanNode-fill",
            this.id,
            params,
            this.$db
          );
          if (success) {
            this.$message.success("修改成功");
            this.$emit("close", true);
          }
        }
      }
    },
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
      width: 100%;

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
