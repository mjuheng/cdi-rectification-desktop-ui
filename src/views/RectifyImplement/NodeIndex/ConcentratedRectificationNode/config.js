// FeedbackMeetNode 配置文件
// 用于配置CommonRender组件所需的各种参数
export function getConfig() {
  return {
    // 页面标题
    name: "集中整改",
    // 标签页配置
    tabs: [
      {
        label: "集中整改",
        value: "ConcentratedRectificationNode-index",
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
          { colKey: "completeSituation", title: "完成情况" },
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
            channel: "基本完成",
            detail: "3",
          },
          {
            applicant: "选人用人方面存在问题",
            channel: "已完成",
            detail: "3",
          },
        ],
      },
    ],
  };
}
