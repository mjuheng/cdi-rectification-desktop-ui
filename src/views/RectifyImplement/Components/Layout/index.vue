<template>
  <div class="layout-wrapper">
    <!-- 顶部标题栏 -->
    <div class="layout-header">
      <div class="layout-header-back" @click="handleBack">
        <ArrowLeftIcon />
      </div>
      <div class="layout-header-title">{{ title }}</div>
    </div>

    <!-- 主要内容区域 -->
    <div class="layout-main">
      <!-- 警告提示框 -->
      <!-- <div class="warning-box">
        <LightingCircleIcon class="warning-icon" />
        <span class="warning-text">
          注意：环节内容需要添加附件内容，请填写完整的附件名称，例如：XXX.docx，保存后需将各类文件放置至本单机版安装包内的[附件]文件夹内。
        </span>
      </div> -->
      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <t-tabs v-model="currentActiveTab" @change="handleTabChange">
          <t-tab-panel :label="item.label" :value="item.value" v-for="(item, index) in tabs" :key="index">
          </t-tab-panel>

        </t-tabs>
      </div>
      <div class="layout-main-content">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowLeftIcon, LightingCircleIcon } from 'tdesign-icons-vue';
import { Tabs, TabPanel, Button, Table } from 'tdesign-vue';

export default {
  components: {
    ArrowLeftIcon,
    LightingCircleIcon,
    Tabs,
    TabPanel,
    Button,
    Table
  },
  props: {
    title: {
      type: String,
      default: "反馈会"
    },
    tabs: {
      type: Array,
      default: () => [
      ]
    },
    activeTab: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentActiveTab: this.activeTab || ''
    };
  },
  watch: {
    // 监听props变化，同步到本地数据
    activeTab(newVal) {
      this.currentActiveTab = newVal;
    },
    // 监听本地数据变化，通过事件通知父组件
    currentActiveTab(newVal) {
      this.$emit('update:activeTab', newVal);
    }
  },
  computed: {
  },
  mounted() {
    // 初始化时，如果没有传入activeTab且tabs有数据，则设置第一个标签为激活状态
    if (!this.currentActiveTab && this.tabs && this.tabs.length > 0) {
      this.currentActiveTab = this.tabs[0].value;
    }
  },
  methods: {
    handleBack() {
      // 返回上一页的逻辑
      if (this.$router) {
        this.$router.back();
      }
    },
    handleTabChange(value) {
      // 标签页切换逻辑
      console.log('Tab changed to:', value);
      // 更新本地状态并通知父组件
      this.currentActiveTab = value;
    },
    handleExport() {
      // 导出功能逻辑
      console.log('Export clicked');
    }
  }
};
</script>

<style lang="less" scoped>
.layout-wrapper {
  width: 100%;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background: url("../../images/layout__bg.jpg") no-repeat top center;
  background-size: 100% 458px;
  font-size: 24px;
}

.layout-header {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  color: #fff;

  .layout-header-back {
    cursor: pointer;
    margin-right: 16px;

    &:hover {
      color: #409eff;
    }
  }

  .layout-header-title {
    font-size: 18px;
    font-weight: 600;
  }
}

.layout-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 4px;
}

.warning-box {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 20px;
  background-color: #ecf5ff;
  border-left: 4px solid red;
  border-radius: 4px;

  .warning-icon {
    flex-shrink: 0;
    margin-right: 8px;
    color: red;
    font-size: 18px;
  }

  .warning-text {
    flex: 1;
    font-size: 18px;
    color: red;
    line-height: 1.5;
  }
}

.tabs-wrapper {
  margin-bottom: 20px;
  border: 1px solid #e7e7e7;
  border-radius: 4px;
  overflow: hidden;
}

.layout-main-content {
  width: 100%;
  height: calc(100% - 144px); // 减去header的高度以及其他元素的高度
  overflow: auto;
}
</style>
