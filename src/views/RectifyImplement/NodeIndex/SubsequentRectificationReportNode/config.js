// FeedbackMeetNode 配置文件
// 用于配置CommonRender组件所需的各种参数
export function getConfig() {
  return {
    // 页面标题
    name: "后续整改情况报告",
    // 标签页配置
    tabs: [
      {
        label: "分项填报",
        value: "SubsequentRectificationReportNode-fill",
        needSidebar: true,
        headerBtns: [
        ],

        columns: [
          { colKey: "serial-number", width: 80, title: "序号" },
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
                        this.openMeasureDrawer(row.id);
                      },
                    },
                  },
                  "编辑"
                ),
              ]);
            },
          },
        ],
        tableData: [
          {
            applicant: "工程使用金额超标",
            channel: "核实追查超标金额去向",
            detail: "3",
            createTime: "基本完成",
          },
          {
            applicant: "选人用人方面存在问题",
            channel: "已完成",
            detail: "3",
            createTime: "基本完成",
          },
        ],
      },
      {
        label: "后续整改情况报告",
        value: "SubsequentRectificationReportNode-report",
        needSidebar: true,
        headerBtns: [
          {
            label: "新增",
            event: () => {
              this.handleAdd();
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
      },
    ],
  };
}
