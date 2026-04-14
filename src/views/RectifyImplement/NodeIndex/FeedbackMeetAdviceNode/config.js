// FeedbackMeetNode 配置文件
// 用于配置CommonRender组件所需的各种参数
export function getConfig() {
  return {
    // 页面标题
    name: "公开反馈意见",
    // 标签页配置
    tabs: [
      {
        label: "公开反馈意见",
        value: "FeedbackMeetAdviceNode-advice",
        needSidebar: false,
        headerBtns: [
          // {
          //   label: "导出",
          //   event: function () {
          //     console.log("点击了导出按钮");
          //   },
          // },
        ],

        columns: [
          { colKey: "serial-number", width: 80, title: "序号" },
          { colKey: "title", title: "事项" },
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
                    on: { click: () => this.handleOpenMatterDrawer(row.id) },
                  },
                  "编辑"
                ),
              ]);
            },
          },
        ],
        tableData: [
          {
            applicant: "巡视反馈新闻稿",
          },
          {
            applicant: "巡视反馈意见党内通报",
          },
          {
            applicant: "巡视反馈新闻稿舆情上报",
          },
        ],
      },
    ],
  };
}
