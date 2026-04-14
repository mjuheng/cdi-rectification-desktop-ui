<template>
  <t-drawer :visible.sync="localVisible" header="编辑" @close="handleClose" size="50%" @confirm="handleConfirm">
    <div class="drawer-content">
      <t-form class="question-form" ref="formDataRef" labelAlign="top" layout="inline" :data="formData">
        <t-row style="width: 100%">
          <MatterCard style="width: 100%" title="" :items="matters">
            <template #main-content>
              <template v-for="item in formItems.slice(0, 1)">
                <t-col :span="4" :key="item.name" v-if="!item.hidden || !item.hidden()">
                  <t-form-item v-bind="item" :rules="item.rules">
                    <component :is="item.type" v-model="formData[item.name]" v-bind="item.attrs" style="width: 100%">
                    </component>
                  </t-form-item>
                </t-col>
              </template>
            </template>
            <template #problem>
              <div class="form-group">
                <template v-for="item in formItems.slice(1, 4)">
                  <t-col :span="4" :key="item.name" v-if="!item.hidden || !item.hidden()">
                    <t-form-item v-bind="item" :rules="item.rules">
                      <component :is="item.type" v-model="formData[item.name]" v-bind="item.attrs" style="width: 100%">
                      </component>
                    </t-form-item>
                  </t-col>
                </template>
              </div>
            </template>
            <template #situation>
              <div class="form-group">
                <template v-for="item in formItems.slice(4, 8)">
                  <t-col :span="6" :key="item.name" v-if="!item.hidden || !item.hidden()">
                    <t-form-item v-bind="item" :rules="item.rules">
                      <t-tooltip v-if="item.tooltip && item.tooltip()" :content="item.tooltip()">
                        <component :is="item.type" v-model="formData[item.name]" v-bind="item.attrs"
                          style="width: 100%"></component>
                      </t-tooltip>
                      <component v-else :is="item.type" v-model="formData[item.name]" v-bind="item.attrs"
                        style="width: 100%"></component>
                    </t-form-item>
                  </t-col>
                </template>
              </div>
            </template>
          </MatterCard>
        </t-row>
      </t-form>
    </div>
  </t-drawer>
</template>

<script>
import { defaultRules, findItemInTaskArray,deepCopy, updateItemInTaskArray, addItemToTaskArray } from "@/utils/index.js";
import MatterCard from "@/views/RectifyImplement/Components/MatterCard.vue";
export default {
  components: {
    MatterCard,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      localVisible: this.visible,
      formData: {
        questionsSpecial:'',
        questionsType: "",
        questionsSubclass: "",
        questionsContent: "",
        performanceContent: "",
        correspondingContent: "",
        focusConcern: "",
      },
      dictKeys: { label: "dicValueName", value: "dicValueCode" },
    };
  },

  watch: {
    // 父组件更新 visible 时同步到本地
    visible(newVal) {
      this.localVisible = newVal;
    },
  },
  computed: {
    formItems() {
      return [
        {
          name: "questionsSpecial",
          label: `${window.APP_CONFIG.isProvince?"整改巡视专项":"整改巡察专项"}`,
          type: "t-select",
          rules: defaultRules(`${window.APP_CONFIG.isProvince?"整改巡视专项":"整改巡察专项"}`, "change"),
          // hidden: () => {
          //   return this.formData.focusConcern == 0;
          // },
          attrs: {
            keys: this.dictKeys,
            clearable: true,
            options: this.questionsSpecial,
          },
        },
        {
          name: "questionsType",
          label: "问题类别",
          type: "t-input",
          attrs: {
            clearable: true,
            onChange: (val, content) => { },
          },
        },
        {
          name: "questionsSubclass",
          label: "问题子类",
          type: "t-input",
          attrs: {
            clearable: true,
            onChange: (val, content) => { },
          },
        },
        {
          name: "questionsContent",
          label: "具体问题",
          type: "t-input",
          attrs: {
            clearable: true,
            onChange: (val, content) => { },
          },
        },
        {
          name: "performanceContent",
          label: "具体表现",
          type: "t-input",
          rules: defaultRules("具体表现"),
          attrs: {
            clearable: true,
          },
        },
        {
          name: "correspondingContent",
          label: `${window.APP_CONFIG.isProvince?"对应四落":"对应四聚焦"}`,
          type: "t-select",
          // tooltip: () => {
          //   return this.fourFallingTypesMap[this.formData.correspondingContent];
          // },
          rules: defaultRules(`${window.APP_CONFIG.isProvince?"对应四落":"对应四聚焦"}`, "change"),
          attrs: {
            keys: this.dictKeys,
            clearable: true,
            options: this.fourFallingTypes,
          },
        },
        {
          name: "focusConcern",
          label: "是否重点关注",
          type: "t-radio-group",
          rules: defaultRules("是否重点关注", "change"),
          attrs: {
            clearable: true,
            options: [
              {
                label: "是",
                value: '是',
              },
              {
                label: "否",
                value: '否',
              },
            ],
          },
        },
        {
          name: "focusSituation",
          label: "重点关注情形",
          type: "t-select",
          rules: defaultRules("重点关注情形", "change"),
          hidden: () => {
            return this.formData.focusConcern == '否';
          },
          attrs: {
            keys: this.dictKeys,
            clearable: true,
            options: this.situations,
          },
        },
      ];
    },
    specialList() {
      return this.getDict.SpecialType;
    },
    fourFallingTypes() {
      let arr1 = [
        {
          dicCode: "落实党的理论和路线方针政策、党中央重大决策部署以及省委工作要求方面",
          dicValueCode: "落实党的理论和路线方针政策、党中央重大决策部署以及省委工作要求方面",
          dicValueName:
            "落实党的理论和路线方针政策、党中央重大决策部署以及省委工作要求方面",
        },
        {
          dicValueCode: "落实全面从严治党战略部署情况",
          dicValueName: "落实全面从严治党战略部署情况",
        },
        {
          dicCode: "FourFallingType",
          dicValueCode: "落实新时代党的组织路线情况",
          dicValueName: "落实新时代党的组织路线情况",
        },
        {
          dicCode: "落实巡视等监督发现问题整改情况",
          dicValueCode: "落实巡视等监督发现问题整改情况",
          dicValueName: "落实巡视等监督发现问题整改情况",
        },
        {
          dicValueCode: "其他",
          dicValueName: "其他",
        },
      ]
      let arr2 = [
        {
          dicValueCode: "聚焦党中央决策部署在基层落实情况",
          dicValueName: "聚焦党中央决策部署在基层落实情况",
        },
        {
          dicValueCode: "聚焦群众身边不正之风和腐败问题",
          dicValueName: "聚焦群众身边不正之风和腐败问题",
        },
        {
          dicValueCode: "聚焦基层党组织和党员队伍建设",
          dicValueName: "聚焦基层党组织和党员队伍建设",
        },
        {
          dicValueCode: "聚焦巡察整改落实情况",
          dicValueName: "聚焦巡察整改落实情况",
        },
        {
          dicValueCode: "其他",
          dicValueName: "其他",
        },
      ]
      return window.APP_CONFIG.isProvince?arr1:arr2;
    },
    situations() {
      return [
        {
          dicValueCode: "未贯彻落实习近平总书记重要指示批示精神和党中央重大决策部署及省委工作要求",
          dicValueName:
            "未贯彻落实习近平总书记重要指示批示精神和党中央重大决策部署及省委工作要求",
        },
        {
          dicValueCode: "“五人小组”会议上、省委巡视工作领导小组会议上点出的具体人、具体事",
          dicValueName:
            "“五人小组”会议上、省委巡视工作领导小组会议上点出的具体人、具体事",
        },
        {
          dicValueCode: "被上级部门通报批评、被主要媒体曝光的问题未进行整改或整改不彻底",
          dicValueName:
            "被上级部门通报批评、被主要媒体曝光的问题未进行整改或整改不彻底",
        },
        {
          dicValueCode: "重大人身财产损失、严重违规违纪违法案件未深挖彻查、以案促改成效不明显",
          dicValueName:
            "重大人身财产损失、严重违规违纪违法案件未深挖彻查、以案促改成效不明显",
        },
        {
          dicValueCode: "其他情形",
          dicValueName: "其他情形",
        },
      ];
    },
    questionsSpecial() {
      let arr = [
        {
          dicValueCode: "巡视",
          dicValueName: "巡视",
        },
        {
          dicCode: "SpecialType",
          dicValueCode: "选人用人专项",
          dicValueName: "选人用人专项",
        },
        {
          dicValueCode: "意识形态专项",
          dicValueName: "意识形态专项",
        },
        {
          dicValueCode: "立行立改",
          dicValueName: "立行立改",
        },
        {
          dicValueCode: "巡察专项",
          dicValueName: "巡察专项",
        },
      ]
      if( window.APP_CONFIG.isProvince){
        return arr
      }else{
        arr[0].dicValueName = "巡察"
        arr[0].dicValueCode = "巡察"
        arr.splice(4,1)
        return arr
      }
    },
    matters() {
      const defaultMatters = [
        {
          title: "问题分类",
          slot: "problem",
        },
        {
          title: "问题情况",
          slot: "situation",
        },
      ];
      return defaultMatters;
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      if (this.type === 'add') return;
      
      // 使用通用工具方法查找FeedbackMeetNode-problemList数组中指定ID的数据项
      const data = deepCopy(await findItemInTaskArray('FeedbackMeetNode-problemList', this.id, this.$db));
      this.formData = data;
      console.log('编辑模式加载的数据:', this.formData);
    },
    handleClose(type = false) {
      this.$emit("close", type);
    },
    async handleConfirm() {
      const validateResult = await this.$refs.formDataRef.validate();
      if (validateResult === true) {
        console.log('表单验证通过，数据:', this.formData);
        if (this.type === 'add') {
          // 使用通用工具方法向FeedbackMeetNode-problemList数组添加新数据
          const success = await addItemToTaskArray('FeedbackMeetNode-problemList', this.formData, this.$db);
          if (success) {
            this.$message.success('保存成功');
            this.handleClose(true);
          } else {
            this.$message.error('保存失败，请重试');
          }
        } else {
          // 编辑逻辑 - 使用通用工具方法更新数据
          const success = await updateItemInTaskArray('FeedbackMeetNode-problemList', this.id, this.formData, this.$db);
          if (success) {
            this.$message.success('更新成功');
            this.handleClose(true);
          } else {
            this.$message.error('更新失败，请重试');
          }
        }

      } else {
        this.$message.warning('请检查表单数据是否正确填写');
      }

    },
    // 改变措施内容
    changeMeasure(row, key, val) {
      this.$set(row, key, val ? 1 : 0);
    },
  },
};
</script>

<style lang="less" scoped>
.drawer-content {
  padding: 0 16px;

  .matter-card+.matter-card {
    margin-top: 24px;
  }

  .form-group {
    display: flex;
    flex-wrap: wrap;
  }

  .question-form {
    /deep/ .t-form__item {
      width: calc(100% - 16px);
      margin-right: 16px;
      margin-bottom: 16px;
    }
  }
}
</style>
