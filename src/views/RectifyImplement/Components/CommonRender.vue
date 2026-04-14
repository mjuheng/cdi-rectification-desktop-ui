<template>
  <div class="node-container">
    <!-- 使用通用Layout组件 -->
    <Layout :title="attrs.name" :tabs="attrs.tabs" :activeTab.sync="activeTab">
      <!-- 内容插槽 -->
      <template #content>
        <div class="node-content-wrapper">
          <!-- 左侧导航菜单 -->
          <div class="node-sidebar" v-if="innerSidebar">
            <div
              v-for="(item, index) in nodeList"
              :key="index"
              :class="[
                'sidebar-item',
                { active: currentSideBarId === item.id },
              ]"
              @click="handleSideBarClick(item)"
            >
              <div class="sidebar-item-name">{{ item.name }}</div>
            </div>
          </div>

          <!-- 右侧内容区域 -->
          <div class="node-content">
            <div class="node-content__header" v-if="innerSubTabs">
              <t-tabs
                v-model="currentSubActiveTab"
                @change="handleSubTabChange"
                class="tabs-wrapper"
              >
                <t-tab-panel
                  :label="item.label"
                  :value="item.value"
                  v-for="(item, index) in subTabs"
                  :key="index"
                >
                </t-tab-panel>
              </t-tabs>
              <div class="tabs-right-btns">
                <t-button
                  v-for="(item, index) in innerHeaderBtns"
                  :key="index"
                  @click="handleHeaderBtnClick(item)"
                  >{{ item.label }}</t-button
                >
              </div>
            </div>

            <div class="node-content__header" v-else>
              <div class="node-content__header-title">事项列表</div>
              <div class="node-content__header-right">
                <t-button
                  v-for="(item, index) in innerHeaderBtns"
                  :key="index"
                  @click="handleHeaderBtnClick(item)"
                  >{{ item.label }}</t-button
                >
              </div>
            </div>
            <div class="node-content__table">
              <t-table
                row-key="key"
                :data="innerTableData"
                :columns="innerColumns"
                size="large"
              ></t-table>
            </div>
          </div>
        </div>
      </template>
    </Layout>
    <slot name="component-solt"></slot>
  </div>
</template>

<script>
// 导入Layout组件
import { CLEAR_REG } from "tdesign-vue/es/_common/js/common";
import Layout from "../Components/Layout/index.vue";
export default {
  name: "CommonRender",
  components: {
    Layout,
  },
  props: {
    attrs: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // 当前选中的节点ID
      currentSideBarId: window.APP_CONFIG.isProvince?"巡视":"巡察", // 默认选中第一个节点

      // 表格数据
      tableData: [
        {
          key: "1",
          applicant: "张三",
          channel: "线上申请",
          detail: {
            email: "zhangsan@example.com",
            phone: "13800000000",
          },
          createTime: "2023-08-15 10:00:00",
        },
        {
          key: "2",
          applicant: "李四",
          channel: "线下申请",
          detail: {
            email: "lisi@example.com",
            phone: "13800000000",
          },
          createTime: "2023-08-15 11:00:00",
        },
      ],
      // 表格列定义
      columns: [],
      activeTab: "",
      //子tabs 数据
      currentSubActiveTab: "拟不在党内公开",
      subTabs: [
        {
          label: "拟不在党内公开",
          value: "拟不在党内公开",
        },
        {
          label: "拟不向社会公开",
          value: "拟不向社会公开",
        },
      ],
      //表格数据
      innerTableData: [],
    };
  },
  computed: {
    innerColumns() {
      // 筛选出当前标签页对应的列
      const activeTabColumns =
        this.attrs.tabs.find((tab) => tab.value === this.activeTab)?.columns ||
        [];
      return activeTabColumns.concat(this.columns);
    },
    // innerTableData(){
    //     return this.attrs.tabs.find(tab => tab.value === this.activeTab)?.tableData || [];
    // },
    innerSidebar() {
      return (
        this.attrs.tabs.find((tab) => tab.value === this.activeTab)
          ?.needSidebar || false
      );
    },
    innerHeaderBtns() {
      return (
        this.attrs.tabs.find((tab) => tab.value === this.activeTab)
          ?.headerBtns || []
      );
    },
    innerSubTabs() {
      return (
        this.attrs.tabs.find((tab) => tab.value === this.activeTab)
          ?.needSubTabs || false
      );
    },
    nodeList() {
      let arr = [
        {
          id: "巡视",
          order: 1,
          name: "巡视",
        },
        {
          id: "选人用人专项",
          order: 2,
          name: "选人用人专项",
        },
        {
          id: "意识形态专项",
          order: 3,
          name: "意识形态专项",
        },
        {
          id: "立行立改",
          order: 4,
          name: "立行立改",
        },
        {
          id: "巡察专项",
          order: 5,
          name: "巡察专项",
        },
      ];
      if (window.APP_CONFIG.isProvince) {
        return arr
      }else{
        arr[0].id='巡察'
        arr[0].name='巡察'
        arr.splice(4,1)
        return arr
      }

    },
  },
  mounted() {},
  watch: {
    activeTab: {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          let query = {};
          if (this.innerSidebar) {
            query.questionsSpecial = this.currentSideBarId;
          }
          if (this.innerSubTabs) {
            if (this.currentSubActiveTab === "拟不在党内公开") {
              query.isOrgUnpublish = true;
            } else {
              query.isSocietyUnpublish = true;
            }
          }
          this.handleGetTableData(query);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    // 导航到指定节点
    handleSideBarClick(item) {
      // 更新当前选中的节点ID
      this.currentSideBarId = item.id;
      this.handleGetTableData({
        questionsSpecial: this.currentSideBarId,
      });
    },
    // 处理头部按钮点击
    handleHeaderBtnClick(btn) {
      if (typeof btn.event === "function") {
        btn.event(this.currentSideBarId);
      }
    },
    // 处理子标签页切换
    handleSubTabChange(newSubTab) {
      this.currentSubActiveTab = newSubTab;
      this.handleRefresh();
    },
    async handleGetTableData(query = {}) {
      console.log("切换", query);
      try {
        // 获取当前任务ID对应的表名
        const currentTaskData = await this.$db.findById("currentTaskId", 1);
        const tableName = currentTaskData?.currentTaskId || "";
        console.log(currentTaskData,"currentTaskData")
        if (!tableName) {
          console.error("未找到当前任务ID对应的表名");
          this.innerTableData = [];
          return;
        }

        // 根据activeTab值获取对应的数据库字段名
        const activeTabValue = this.activeTab;
        if (!activeTabValue) {
          console.error("activeTab值为空，无法获取对应数据");
          this.innerTableData = [];
          return;
        }

        // 查找mgoiy1rueaalu表中id为1的数据
        const tableData = await this.$db.findById(tableName, 1);
        if (!tableData) {
          console.error(`未找到表${tableName}中id为1的数据`);
          this.innerTableData = [];
          return;
        }

        // 根据activeTab值获取对应的数组数据
        let arrayData = tableData[activeTabValue] || [];
        console.log(`获取到${activeTabValue}数组数据:`, arrayData);

        // 如果有查询参数，则进行数据筛选
        if (Object.keys(query).length > 0) {
          arrayData = this.filterArrayData(arrayData, query);
          console.log(`根据查询参数筛选后的数据:`, arrayData);
        }
        // 将数组数据赋值给innerTableData
        this.$nextTick(() => {
          this.innerTableData = arrayData;
        });
      } catch (error) {
        console.error("获取表格数据失败:", error);
        this.innerTableData = [];
      }
    },
    handleRefresh() {
      let query = {};
      if (this.innerSidebar) {
        query.questionsSpecial = this.currentSideBarId;
      }
      if (this.innerSubTabs) {
        if (this.currentSubActiveTab === "拟不在党内公开") {
          query.isOrgUnpublish = true;
        } else {
          query.isSocietyUnpublish = true;
        }
      }
      this.handleGetTableData(query);
    },
    filterArrayData(arrayData, query) {
      if (!arrayData || !Array.isArray(arrayData)) {
        return [];
      }
      return arrayData.filter((item) => {
        // 遍历查询参数，检查每个条件
        for (const [key, value] of Object.entries(query)) {
          // 如果查询值是数组，检查是否包含
          if (Array.isArray(value)) {
            if (!value.includes(item[key])) {
              return false;
            }
          }
          // 如果查询值是字符串，进行模糊匹配
          else if (typeof value === "string") {
            if (
              !String(item[key] || "")
                .toLowerCase()
                .includes(value.toLowerCase())
            ) {
              return false;
            }
          }
          // 如果查询值是数字或布尔值，进行精确匹配
          else {
            if (item[key] !== value) {
              return false;
            }
          }
        }
        return true; // 所有条件都满足
      });
    },
  },
};
</script>

<style lang="less" scoped>
.node-container {
  width: 100%;
  height: 100%;

  .node-content-wrapper {
    display: flex;
    width: 100%;
    height: 100%;

    .node-sidebar {
      width: 240px;
      height: 100%;
      border: 1px solid #e7e7e7;
      flex-shrink: 0;

      .sidebar-item {
        display: flex;
        align-items: center;
        padding: 16px 24px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &:hover {
          background-color: #edf2ff;
        }

        &.active {
          background-color: #edf2ff;
          border-left: 4px solid #0052d9;
          color: #0052d9;

          .sidebar-item-number {
            background-color: #edf2ff;
            border-left: 4px solid #0052d9;
            color: #0052d9;
          }
        }

        .sidebar-item-name {
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .node-content {
      flex: 1;
      padding: 0 24px;
      background-color: #fff;
      overflow-y: auto;
      min-height: 0;

      .node-content__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        color: rgba(0, 0, 0, 0.85);
        font-size: 20px;
        position: relative;

        .node-content__header-title {
          font-weight: 600;
          border-left: 4px solid #0052d9;
          padding-left: 16px;
          box-sizing: border-box;
        }

        .node-content__header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tabs-right-btns {
          display: flex;
          align-items: center;
          gap: 8px;
          position: absolute;
          top: 14px;
          right: 0;
          z-index: 999;
        }
      }

      .tabs-wrapper {
        border: 1px solid #e7e7e7;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0px;
        position: relative;
        width: 100%;
      }

      .node-content__table {
        width: 100%;
        height: calc(100% - 60px);
        border: 1px solid #e7e7e7;

        /deep/ .t-table__th-cell-inner {
          font-weight: 600;
          color: #000;
        }
      }
    }
  }
}
</style>
