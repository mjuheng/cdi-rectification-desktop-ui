// FeedbackMeetNode 配置文件
// 用于配置CommonRender组件所需的各种参数
export function getConfig() {
  return {
    // 页面标题
    name: "整改方案",
    // 标签页配置
    tabs: [
      {
        label: "分项填报",
        value: "RectificationPlanNode-fill",
        needSidebar: true,
        headerBtns: [
          {
            label: "保存",
            event: () => {
              this.handleSave();
            },
          },
        ],

        columns: [
          { colKey: "serial-number", width: 80, title: "序号" },
          { colKey: "performanceContent", title: "具体表现" },
          { colKey: "rectifyGoal", title: "整改落实目标" },
          {
            colKey: "leaderList",
            title: "责任领导",
            cell: (h, { row }) => {
              return row?.leaderList?.[0]?.responsibleLeader || "-";
            },
          },
          { colKey: "responsibleDepartment", title: "责任部门" },
          { colKey: "completeTime", title: "完成时间" },
          {
            colKey: "measureList",
            title: "措施数量",
            cell: (h, { row }) => {
              return row?.measureList?.length || "0";
            },
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
                    on: {
                      click: () => {
                        this.MatterEditDrawer(row.id);
                      },
                    },
                  },
                  "编辑"
                ),
              ]);
            },
          },
        ],
      },
      {
        label: "整改方案",
        value: "RectificationPlanNode-scheme",
        needSidebar: true,
        headerBtns: [
          {
            label: "新增",
            event: (currentSideBarId) => {
              this.handleAdd(currentSideBarId);
            },
          },
          // {
          //   label: "导出",
          //   event: function () {
          //     console.log("点击了导出按钮");
          //   },
          // },
        ],
        columns: [
          { colKey: "serial-number", width: 80, title: "序号" },
          { colKey: "fileName", title: "文件名称" },
          { colKey: "version", title: "版本" },
          {
            title: "操作栏",
            colKey: "operate",
            width: 150,
            cell: (h, { row }) => {
              return h("div", { class: "table-operations" }, [
                h(
                  "t-link",
                  {
                    props: { theme: "danger", hover: "color" },
                    attrs: { "data-id": row.key },
                    on: {
                      click: () => {
                        this.handleDelete(row);
                      },
                    },
                  },
                  "删除"
                ),
              ]);
            },
          },
        ],
        tableData: [],
      },
    ],
  };
}
