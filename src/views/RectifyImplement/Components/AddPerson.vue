<template>
  <div class="components-wrapper">
    <div
      class="components-item"
      v-for="(person, index) in internalValue"
      :key="index"
    >
      <t-input 
        :placeholder="index === 0 ? '请输入责任领导姓名（必填）' : '请输入责任领导姓名'"
        v-model="person.responsibleLeader"
        @change="handleInputChange"
      ></t-input>
      <t-radio-group v-model="person.responsibleLeaderType" @change="handleInputChange">
        <t-radio value="党组织主要负责人" allow-uncheck
          >党组织主要负责人</t-radio
        >
        <t-radio value="其他领导班子成员">其他领导班子成员</t-radio>
      </t-radio-group>
      <div class="item-right-btn">
        <div v-if="index === 0">(必填)</div>
        <div v-else>
          <CloseCircleIcon
            color="#e37318"
            name="t-close-circle"
            size="24px"
            class="item-close-btn"
            @click="handleDeletePerson(index)"
          ></CloseCircleIcon>
        </div>
      </div>
    </div>
    <div class="line-btn">
      <div class="add-btn" @click="handleAddPerson">添加人员</div>
    </div>
  </div>
</template>

<script>
import { CloseCircleIcon } from "tdesign-icons-vue";
export default {
  name: "AddPerson",
  components: {
    CloseCircleIcon,
  },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      internalValue: []
    };
  },
  watch: {
    value: {
      handler(newVal) {
        // 当外部传入的value变化时，更新内部值
        if (newVal && Array.isArray(newVal)) {
          // 确保每个人员对象都有name和role属性
          this.internalValue = newVal.map(person => {
            return {
              responsibleLeader: person.responsibleLeader || '',
              responsibleLeaderType: person.responsibleLeaderType || ''
            };
          });
        } else {
          this.internalValue = [];
        }
        
        // 如果数组为空，添加一个默认人员
        if (!this.internalValue.length) {
          this.internalValue = [{
            responsibleLeader: '',
            responsibleLeaderType: '党组织主要负责人'
          }];
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {},
  mounted() {
    // 如果初始值为空，添加一个默认人员
    if (!this.internalValue.length) {
      this.internalValue = [{
        responsibleLeader: '',
        responsibleLeaderType: '党组织主要负责人'
      }];
    }
  },
  methods: {
    handleInputChange() {
      // 触发更新，确保数据同步
      this.$nextTick(() => {
        this.$emit('input', [...this.internalValue]);
      });
    },
    handleAddPerson() {
      this.internalValue.push({
        responsibleLeader: '',
        responsibleLeaderType: ''
      });
      this.handleInputChange();
    },
    handleDeletePerson(index) {
      if (this.internalValue.length > 1) {
        this.internalValue.splice(index, 1);
        this.handleInputChange();
      } else {
        this.$message.warning('至少需要保留一个责任领导');
      }
    }
  },
};
</script>

<style lang="less" scoped>
.components-wrapper {
  width: 100%;

  .components-item {
    padding: 8px 24px 8px 0;
    margin-bottom: 16px;
    display: grid;
    grid-template-columns: 50% 50% ;
    grid-gap: 16px;
    position: relative;
    .item-right-btn {
      width: 40px;
      height:40px;
      position: absolute;
      top: 0;
      right: 0;
      // transform: translateY(-50%);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .line-btn {
    display: flex;
    justify-content: center;
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
}
</style>
