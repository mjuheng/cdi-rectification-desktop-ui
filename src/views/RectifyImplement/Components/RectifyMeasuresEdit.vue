<template>
  <div class="rectify-measures">
    <div
      class="rectify-measures_item"
      v-for="(item, index) in innerMeasures"
      :key="index"
    >
      <div class="item-top">
        <div class="item-top__content">
          {{ `措施内容${index + 1}:` }}
          <div class="content-text">
            {{ item.measuresContent }}
          </div>
        </div>
        <div class="item-top__tags">
          <t-button
            variant="outline"
            theme="primary"
            v-if="!item.expand && !isView"
            @click="handleMeasureEdit(index)"
            >编辑</t-button
          >
          <t-button
            variant="outline"
            theme="primary"
            class="mgl8"
            v-if="!item.expand && !isView"
            @click="handleMeasureDel(index)"
            >删除</t-button
          >
          <t-button
            variant="outline"
            theme="primary"
            v-if="item.expand && !isView"
            @click="handleMeasureSave(index)"
            >保存</t-button
          >
          <t-button
            variant="outline"
            theme="primary"
            v-if="isView"
            @click="handleMeasureView(index, item.expand)"
            >{{ item.expand ? "收起" : "展开" }}</t-button
          >
        </div>
      </div>
      <div class="item-bottom" v-if="!item.expand">
        <div
          class="item-bottom__item"
          v-for="(detail, detailIndex) in subItems"
          :key="detailIndex"
        >
          <div class="item-label">{{ detail.label }}:</div>
          <div class="item-value" v-if="detail.label === '责任人'">
            {{ innerPerson(item) }}
          </div>
          <div class="item-value" v-else>{{ item[detail.key] || "--" }}</div>
        </div>
      </div>
      <div class="item-bottom" v-else>
        <t-form
          ref="measureFormRef"
          layout="inline"
          class="common-form grid3"
          labelAlign="top"
          :data="item"
        >
          <t-form-item
            v-for="measureItem in measureItems(index)"
            :key="measureItem.name"
            v-bind="measureItem"
            :class="measureItem.class ? measureItem.class : ''"
          >
            <component
              class="dynamic-form-item"
              :is="measureItem.type"
              v-bind="measureItem.attrs(index)"
              v-model="item[measureItem.name]"
            ></component>
          </t-form-item>
        </t-form>
      </div>
      <div class="item-form" v-if="item.expand">
        <t-form
          ref="editFormRef"
          layout="inline"
          class="measure-form"
          labelAlign="top"
          :data="item"
        >
          <div
            class="form-item-wrapper"
            v-for="(innerItem, innerIndex) in editItems(index)"
            :key="innerIndex"
          >
            <t-form-item
              v-for="obj in innerItem"
              :key="obj.name"
              v-bind="obj"
              :class="obj.class ? obj.class : ''"
              class="form-item"
            >
              <component
                class="dynamic-form-item"
                :is="obj.type"
                v-bind="obj.attrs"
                v-model="item[obj.name]"
              ></component>
            </t-form-item>
            <div>
              <File
                v-model="
                  item.filesMap[
                    innerItem.length > 1 ? innerItem[1].name : innerItem[0].name
                  ]
                "
              ></File>
            </div>
          </div>
        </t-form>
      </div>
    </div>
  </div>
</template>

<script>
import { deepCopy } from "@/utils/index.js";
import AddPerson from "./AddPerson.vue";
import File from "./File.vue";
export default {
  name: "RectifyMeasures",
  components: { AddPerson, File },
  props: {
    measures: {
      type: Array,
      default: () => [],
    },
    attrs: {
      type: Object,
      default: () => ({}),
    },
    isView: {
      type: Boolean,
      default: false,
    },
    completeTime: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      checkKeys: {
        establishSystem: "建章立制",
        recoverLoss: "挽回损失",
        accountability: "追责问责",
        drawInferences: "举一反三",
        specialRectification: "是否专项整治",
        significantMeasures: "重大措施",
        complete: "完成情况",
        rectificationOther: "其他",
      },
      innerMeasures: [],
      filesMap: {
        completeContent: [],
        establishSystemContent: [],
        recoverLossContent: [],
        accountabilityContent: [],
        drawInferencesContent: [],
        specialRectificationContent: [],
        rectificationOtherContent: [],
        // significantMeasuresContent: [],
      },
      requireUploadFileKey: [
        "establishSystem",
        "recoverLoss",
        "accountability",
        "drawInferences",
        "specialRectification",
        "rectificationOther",
        // "significantMeasures",
      ],
      requireKey: ["measuresContent", "completeSituation", "completeContent"],
      uploaderRefs: [
        "commonUploaderRef",
        "establishSystemUploaderRef",
        "recoverLossUploaderRef",
        "accountabilityUploaderRef",
        "drawInferencesUploaderRef",
      ],
    };
  },
  watch: {
    measures: {
      handler(newVal) {
        this.composeDefaultData(newVal);
        console.log(this.innerMeasures, "inner1111");
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    subItems() {
      return [
        {
          label: "责任部门",
          key: "responsibleDepartment",
        },
        {
          label: "责任人",
          key: "responsiblePerson",
        },
        // {
        //   label: "牵头领导",
        //   key: "leadLeader",
        // },
        // {
        //   label: "党组织主要负责人",
        //   key: "partyOrgMainPerson",
        // },
        // {
        //   label: "领导班子成员",
        //   key: "leadershipTeam",
        // },
        {
          label: "完成时间",
          key: "cutoffTime",
        },
      ];
    },
    editItems() {
      return function (index) {
        return [
          [
            {
              type: "t-radio-group",
              label: "完成情况",
              name: "completeSituation",
              class: "span3",
              attrs: {
                disabled: this.isView ? true : false,
                options: [
                  { label: "未完成", value: 0 },
                  { label: "基本完成", value: 1 },
                  { label: "已完成", value: 2 },
                ],
              },
              rules: [
                {
                  required: true,
                  trigger: "change",
                  message: `请选择完成情况`,
                },
              ],
            },
            {
              type: "t-textarea",
              label: "完成概述",
              name: "completeContent",
              class: "span3",
              attrs: {
                disabled: this.isView ? true : false,
              },
              rules: [
                {
                  required: true,
                  trigger: "change",
                  message: `请输入完成概述`,
                },
              ],
            },
          ],
          [
            {
              label: "完善制度",
              name: "establishSystemContent",
              type: "t-input-number",
              attrs: {
                suffix: "项",
                disabled: this.isView ? true : false,
              },
              rules: [
                {
                  required: !this.isView
                    ? this.innerMeasures[index]?.establishSystem === 1
                    : false,
                  message: `请输入完善制度`,
                },
                {
                  validator: (val) => {
                    return this.innerMeasures[index]?.establishSystem === 1
                      ? val > 0
                      : val > -1;
                  },
                  message: `请输入完善制度`,
                },
              ],
            },
          ],
          // [
          //   {
          //     label: "建章立制",
          //     name: "establishSystemContent",
          //     type: "t-input-number",
          //     attrs: {
          //       suffix: "项",
          //       disabled: this.isView ? true : false,
          //     },
          //     rules: [
          //       {
          //         required: !this.isView
          //             ? this.innerMeasures[index]?.establishSystem === 1
          //             : false,
          //         message: `请输入建章立制`,
          //       },
          //       {
          //         validator: (val) => {
          //           return this.innerMeasures[index]?.establishSystem === 1
          //               ? val > 0
          //               : val > -1;
          //         },
          //         message: `请输入建章立制`,
          //       },
          //     ],
          //   },
          // ],
          [
            {
              label: "挽回损失",
              name: "recoverLossContent",
              type: "t-input-number",
              attrs: {
                suffix: "万元",
                disabled: this.isView ? true : false,
              },
              rules: [
                {
                  required: !this.isView
                    ? this.innerMeasures[index]?.recoverLoss === 1
                    : false,
                  message: `请输入挽回损失`,
                },
                {
                  validator: (val) => {
                    return this.innerMeasures[index]?.recoverLoss === 1
                      ? val > 0
                      : val > -1;
                  },
                  message: `请输入挽回损失`,
                },
              ],
            },
          ],
          [
            {
              label: "追责问责",
              name: "accountabilityContent",
              type: "t-input-number",
              attrs: {
                suffix: "人",
                disabled: this.isView ? true : false,
              },
              rules: [
                {
                  required: !this.isView
                    ? this.innerMeasures[index]?.accountability === 1
                    : false,
                  message: `请输入追责问责`,
                },
                {
                  validator: (val) => {
                    return this.innerMeasures[index]?.accountability === 1
                      ? val > 0
                      : val > -1;
                  },
                  message: `请输入追责问责`,
                },
              ],
            },
          ],
          [
            {
              label: "举一反三",
              name: "drawInferencesContent",
              type: "t-input-number",
              attrs: {
                suffix: "项",
                disabled: this.isView ? true : false,
              },
              rules: [
                {
                  required: !this.isView
                    ? this.innerMeasures[index]?.drawInferences === 1
                    : false,
                  message: `请输入举一反三`,
                },
                {
                  validator: (val) => {
                    return this.innerMeasures[index]?.drawInferences === 1
                      ? val > 0
                      : val > -1;
                  },
                  message: `请输入举一反三`,
                },
              ],
            },
          ],
          [
            {
              label: "专项整治",
              name: "specialRectificationContent",
              type: "t-input-number",
              attrs: {
                suffix: "项",
                disabled: this.isView ? true : false,
              },
              rules: [
                {
                  required: !this.isView
                    ? this.innerMeasures[index]?.specialRectification === 1
                    : false,
                  message: `请输入专项整治`,
                },
                {
                  validator: (val) => {
                    return this.innerMeasures[index]?.specialRectification === 1
                      ? val > 0
                      : val > -1;
                  },
                  message: `请输入专项整治`,
                },
              ],
            },
          ],
          [
            {
              label: "其他",
              name: "rectificationOtherContent",
              // type: "t-input-number",
              // attrs: {
              //   suffix: "项",
              //   disabled: this.isView ? true : false,
              // },
              rules: [
                {
                  required: !this.isView
                      ? this.innerMeasures[index]?.rectificationOther === 1
                      : false,
                  message: `请输入其他`,
                },
                {
                  validator: (val) => {
                    return this.innerMeasures[index]?.rectificationOther === 1
                        ? val > 0
                        : val > -1;
                  },
                  message: `请输入其他`,
                },
              ],
            },
          ],
          // [
          //   {
          //     label: "重大措施",
          //     name: "significantMeasuresContent",
          //     type: "t-input-number",
          //     attrs: {
          //       suffix: "项",
          //       disabled: this.isView ? true : false,
          //     },
          //     rules: [
          //       {
          //         required: !this.isView
          //           ? this.innerMeasures[index].requireKey.includes(
          //               "significantMeasuresContent"
          //             )
          //           : false,
          //         message: `请输入重大措施`,
          //       },
          //       {
          //         validator: (val) => {
          //           return this.innerMeasures[index].requireKey.includes(
          //             "significantMeasuresContent"
          //           )
          //             ? val > 0
          //             : val > -1;
          //         },
          //         message: `请输入重大措施`,
          //       },
          //     ],
          //   },
          // ],
        ];
      };
    },
    fileRequire() {
      return function (value, index) {
        const { rules, name } = value[0];
        return rules[0].required || !!this.innerMeasures[index][name];
      };
    },
    measureItems() {
      return function (index) {
        let arr = [
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
        ];
        if (this.innerMeasures[index].isLoaclAdd) {
          arr.push(
            {
              type: "AddPerson",
              label: "责任领导",
              name: "leaderList",
              class: "span3",
              // requiredMark: true,
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
              label: "责任部门",
              name: "responsibleDepartment",
              attrs: () => {
                return {
                  disabled: false,
                };
              },
            },
            {
              type: "t-date-picker",
              label: "预计完成时间",
              name: "cutoffTime",
              attrs: () => {
                return {
                  disabled: false,
                  disableDate: (val) => {
                    return new Date(val) > new Date(this.completeTime);
                  },
                };
              },
              rules: [
                {
                  required: true,
                  trigger: "change",
                  message: `请选择完成时间`,
                },
              ],
            }
          );
        }
        return arr;
      };
    },
  },
  mounted() {},
  methods: {
    handleMeasureEdit(index) {
      const allCollapsed = this.innerMeasures.every(
        (item) => item.expand === false
      );
      if (allCollapsed) {
        // 所有expand都是false时的逻辑
        this.$set(this.innerMeasures[index], "expand", true);
      } else {
        this.$message.error("有措施未保存");
      }
    },
    async handleMeasureSave(index) {
      this.innerMeasures[index].fileList = Object.values(
        this.innerMeasures[index].filesMap
      ).flat();
      const formResult = await this.$refs.editFormRef[0].validate();
      const measureRusult = await this.$refs.measureFormRef[0].validate();

      // 文件校验逻辑
      let fileValid = true;
      const currentMeasure = this.innerMeasures[index];

      // 根据requireKey检查必填文件是否上传
      if (currentMeasure.requireKey && currentMeasure.requireKey.length > 0) {
        const uploadedFiles = currentMeasure.fileList || [];

        // 检查requireKey中是否包含文件相关的字段
        const fileRelatedKeys = currentMeasure.requireKey.filter((key) =>
          key.includes("Content")
        );

        if (fileRelatedKeys.length > 0) {
          // 检查每个文件相关字段是否有对应的文件上传
          for (const key of fileRelatedKeys) {
            const fileTypeKey = key.replace("Content", "");
            const filesForThisKey =
              currentMeasure.filesMap[`${fileTypeKey}Content`] || [];

            if (filesForThisKey.length === 0) {
              fileValid = false;
              this.$message.error(
                `请上传${this.checkKeys[fileTypeKey] || fileTypeKey}相关的文件`
              );
              break;
            }
          }
        }
      }

      // 检查文件内容是否完整（File组件中的文件名称和类型）
      if (fileValid) {
        // 检查filesMap中每个文件对象的内容是否完整
        for (const [key, fileArray] of Object.entries(
          currentMeasure.filesMap
        )) {
          for (const fileObj of fileArray) {
            if (!fileObj.fileName || !fileObj.fileName.trim()) {
              fileValid = false;
              this.$message.error("请填写完整的文件名称");
              break;
            }
            if (!fileObj.fileType) {
              fileValid = false;
              this.$message.error("请选择文件密级类型");
              break;
            }
          }
          if (!fileValid) break;
        }
      }

      if (formResult == true && measureRusult == true && fileValid) {
        console.log(this.innerMeasures, "inner");
        this.$emit("onMeasureSave", this.innerMeasures);
        this.$set(this.innerMeasures[index], "expand", false);
      } else {
        this.$message.error("有措施未完善");
      }
    },
    // 数据回显
    composeDefaultData(val) {
      const orignData = {
        establishSystemContent: 0, //
        recoverLossContent: 0, ///
        accountabilityContent: 0, //
        drawInferencesContent: 0, //
        specialRectificationContent: 0, //
        rectificationOtherContent:0 ,
      };
      this.innerMeasures = deepCopy(val).map((o) => {
        let [requireKey, requireUploadFileCount] = [
          ["completeSituation", "completeContent"],
          1,
        ];
        let arr = this.requireUploadFileKey
          .filter((key) => o[key] == 1)
          .map((o) => `${o}Content`);

        // 确保每个措施项都包含orignData中定义的所有属性
        const defaultData = { ...orignData };
        for (let key in defaultData) {
          if (o[key] === undefined || o[key] === null) {
            o[key] = defaultData[key];
          }
        }

        return {
          ...o,
          requireKey: requireKey.concat(arr),
          requireUploadFileCount: requireUploadFileCount + arr.length,
          isRequire: false,
          expand: false,
          filesMap: o.filesMap || {
            completeContent: [],
            establishSystemContent: [],
            recoverLossContent: [],
            accountabilityContent: [],
            drawInferencesContent: [],
            specialRectificationContent: [],
            rectificationOtherContent: [],
          },
        };
      });
    },
    // 从表单数据中获取文件数据
    getFilesFromFormData(item) {
      const fileList = item?.fileList || [];
      const result = {};

      // 初始化result结构与filesMap相同
      for (let key in this.filesMap) {
        result[key] = [];
      }

      fileList.forEach((f) => {
        for (let key in this.filesMap) {
          if (f.businessType && f.businessType.indexOf(key) >= 0) {
            result[key].push(f);
          }
        }
      });

      return result;
    },
    async handleValidate() {
      let over = true;
      this.setIsRequireToFormData();
      for (let i = 0; i < this.innerMeasures.length; i++) {
        if (this.innerMeasures[i].isRequire == true) {
          this.$message.error(`第${i + 1}条措施未完善`);
          over = false;
        }
        if (this.innerMeasures[i].expand == true) {
          this.$message.error(`第${i + 1}条措施未保存`);
          over = false;
        }
      }
      return over;
    },
    // 校验措施必填项
    setIsRequireToFormData() {
      this.innerMeasures.map((item) => {
        const { requireKey, requireUploadFileCount, fileList } = item;
        item.isRequire = false;
        if (
          Array.isArray(fileList) &&
          fileList.length < requireUploadFileCount
        ) {
          item.isRequire = true;
        }
        for (let j = 0; j < requireKey.length; j++) {
          const key = requireKey[j];
          // 措施必填内容数据未填写
          if (["", null, undefined].includes(item[key])) {
            item.isRequire = true;
          }
        }
      });
    },
    handleMeasureView(index, flag) {
      this.$set(this.innerMeasures[index], "expand", !flag);
    },
    handleMeasureDel(index) {
      this.innerMeasures.splice(index, 1);
      this.$emit("onMeasureSave", this.innerMeasures);
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
  },
};
</script>

<style lang="less" scoped>
.rectify-measures {
  &_item {
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    &__content {
      flex: 1;
      font-size: 14px;
      line-height: 1.5;

      .content-text {
        margin-top: 8px;
        color: #666;
        word-break: break-all;
      }
    }

    &__tags {
      margin-left: 16px;

      .t-tag {
        margin-left: 8px;
      }
    }
  }

  .item-bottom {
    display: flex;
    flex-wrap: wrap;

    &__item {
      display: flex;
      width: 50%;
      margin-bottom: 8px;
      font-size: 12px;

      .item-label {
        color: #999;
        margin-right: 8px;
      }

      .item-value {
        color: #333;
      }
    }
  }
  .item-form {
    width: 100%;
    .measure-form {
      display: grid;
      grid-template-columns: 1fr;
      .form-item-wrapper {
        padding: 16px 0;
        border-bottom: 1px solid #e7e7e7;
        .form-item {
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
        }
      }
    }
  }
  .mgl8 {
    margin-left: 8px;
  }
}
</style>
