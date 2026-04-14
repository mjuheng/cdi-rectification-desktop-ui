<template>
  <t-drawer
    :visible="visible"
    :header="`新增${currentTab}`"
    @close="handleClose"
    :onConfirm="handleSubmit"
    size="50%"
  >
    <div class="drawer-content">
      <div class="drawer-item">
        <t-table
          class="matters-table"
          rowKey="id"
          :data="innerTableData"
          :columns="columns"
          :selected-row-keys="selectedRowKeys"
          @select-change="handleSelectChange"
        >
        </t-table>
        <MeasureDrawer
          :visible.sync="measureDrawerVisible"
          :id="measureDrawerId"
          type="PublicRectificationSituationNode-unpublished"
          :visibleType="visibleType"
          v-if="measureDrawerVisible"
          @close="closeMeasureDrawer"
        ></MeasureDrawer>
      </div>
    </div>
  </t-drawer>
</template>

<script>
import {
  defaultRules,
  findItemInTaskArray,
  deepCopy,
  updateItemInTaskArray,
  addItemToTaskArray,
} from "@/utils/index.js";
import MeasureDrawer from "@/views/RectifyImplement/Components/MeasureDrawer.vue";
export default {
  components: {
    MeasureDrawer,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    currentTab: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      innerTableData: [],
      measureDrawerVisible: false,
      measureDrawerId: "",
      visibleType: "edit",
      selectedRowKeys: [],
    };
  },

  watch: {},
  computed: {
    columns() {
      return [
        {
          colKey: "row-select",
          type: "multiple",
          // 禁用行选中方式一：使用 disabled 禁用行（示例代码有效，勿删）。disabled 参数：{row: RowData; rowIndex: number })
          // 这种方式禁用行选中，当前行会添加行类名 t-table__row--disabled，禁用行文字变灰
          // disabled: ({ rowIndex }) => rowIndex === 1 || rowIndex === 3,

          // 禁用行选中方式二：使用 checkProps 禁用行（示例代码有效，勿删）
          // 这种方式禁用行选中，行文本不会变灰
          // checkProps: ({ rowIndex }) => ({ disabled: rowIndex % 2 !== 0 }),
          width: 50,
        },
        { colKey: "performanceContent", title: "具体表现" },
        { colKey: "rectifyGoal", title: "整改落实目标" },
        {
          colKey: "measureList",
          title: "措施数量",
          cell: (h, { row }) => {
            return row?.measureList?.length || "0";
          },
        },
        { colKey: "completeSituation", title: "完成情况" },
        {
          colKey: "completeTime",
          title: "完成时间",
        },
        {
          title: "操作栏",
          colKey: "operate",
          width: 150,
          cell: (h, { row }) => {
            return h("div", { class: "table-operations" }, [
              h(
                "t-link",
                {
                  props: { theme: "primary", hover: "color" },
                  attrs: { "data-id": row.key },
                  on: { click: () => this.handleCheck("check", row.id) },
                },
                "查看"
              ),
            ]);
          },
        },
      ];
    },
  },
  mounted() {
    console.log(this.currentTab, "currentTab1111111111111111111");
    this.handleGetTableData();
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    async handleGetTableData(query = {}) {
      try {
        // 获取当前任务ID对应的表名
        const currentTaskData = await this.$db.findById("currentTaskId", 1);
        const tableName = currentTaskData?.currentTaskId || "";

        if (!tableName) {
          console.error("未找到当前任务ID对应的表名");
          this.innerTableData = [];
          return;
        }

        // 根据activeTab值获取对应的数据库字段名
        const activeTabValue = "PublicRectificationSituationNode-unpublished";
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
        this.innerTableData = arrayData;
      } catch (error) {
        console.error("获取表格数据失败:", error);
        this.innerTableData = [];
      }
    },
    handleCheck(visibleType, id) {
      this.measureDrawerVisible = true;
      this.measureDrawerId = id;
      this.visibleType = visibleType;
    },
    closeMeasureDrawer() {
      this.measureDrawerVisible = false;
      this.measureDrawerId = "";
      this.visibleType = "edit";
    },
    handleSelectChange(keys, context) {
      this.selectedRowKeys = keys;
      console.log(context, "context");
    },
    async handleSubmit() {
      console.log(this.selectedRowKeys, "selectedRowKeys");
      if (this.selectedRowKeys.length === 0) {
        this.$message.error("请选择要操作的行");
        return;
      }

      try {
        // 获取当前任务ID对应的表名
        const currentTaskData = await this.$db.findById("currentTaskId", 1);
        const tableName = currentTaskData?.currentTaskId || "";

        if (!tableName) {
          this.$message.error("未找到当前任务ID对应的表名");
          return;
        }

        // 查找mgoiy1rueaalu表中id为1的数据
        const tableData = await this.$db.findById(tableName, 1);
        if (!tableData) {
          this.$message.error(`未找到表${tableName}中id为1的数据`);
          return;
        }

        // 获取PublicRectificationSituationNode-unpublished数组数据
        const arrayFieldName = "PublicRectificationSituationNode-unpublished";
        const arrayData = tableData[arrayFieldName] || [];

        if (arrayData.length === 0) {
          this.$message.error("未找到要操作的数据");
          return;
        }

        // 批量更新选中的行，将isOrgUnpublish改为true
        const updatePromises = this.selectedRowKeys.map(async (id) => {
          const itemIndex = arrayData.findIndex((item) => item.id === id);
          if (itemIndex !== -1) {
            // 更新数据项，将isOrgUnpublish改为true
            const org = {
              isOrgUnpublish: true,
              OrgUnpublishMap: {
                issueNoPublic: "",
                issueNoPublicReason: "",
                issueRectificationNoPublic: "",
                issueRectificationNoPublicReason: "",
              },
            };
            const society = {
              isSocietyUnpublish: true,
              SocietyUnpublishMap: {
                issueNoPublic: "",
                issueNoPublicReason: "",
                issueRectificationNoPublic: "",
                issueRectificationNoPublicReason: "",
              },
            };
            const updatedItem = {
              ...arrayData[itemIndex],
              ...(this.currentTab === "拟不在党内公开" ? org : society),
              updatedAt: new Date().toISOString(),
            };
            arrayData[itemIndex] = updatedItem;
          }
        });

        await Promise.all(updatePromises);

        // 更新数据库
        await this.$db.update(tableName, 1, {
          [arrayFieldName]: arrayData,
        });

        this.$message.success(`成功更新${this.selectedRowKeys.length}条数据`);

        // 刷新表格数据
        this.handleGetTableData();

        // 清空选中状态
        this.selectedRowKeys = [];

        // 关闭抽屉
        this.$emit("close", true);
      } catch (error) {
        console.error("更新数据失败:", error);
        this.$message.error("更新数据失败，请重试");
      }
    },
  },
};
</script>

<style lang="less" scoped>
.drawer-content {
  padding: 0 16px;
}
</style>
