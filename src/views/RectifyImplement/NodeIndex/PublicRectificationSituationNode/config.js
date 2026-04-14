// FeedbackMeetNode 配置文件
// 用于配置CommonRender组件所需的各种参数
export function getConfig() {
  return {
    // 页面标题
    name: "公开整改情况",
    // 标签页配置
    tabs: [
      {
        label: "拟不公开事项填报",
        value: "PublicRectificationSituationNode-unpublished",
        needSidebar: false,
        needSubTabs: true,
        headerBtns: [
          {
            label: "新增拟不公开事项",
            event: () => {
              this.handleAddUnpublished();
            },
          },
          {
            label: "保存",
            event: () => {
              this.handleSave();
            },
          },
        ],

        columns: [
          { colKey: "serial-number", width: 80, title: "序号" },
          { colKey: "questionsContent", title: "具体问题（原文）" },
          {
            title: "具体问题（拟不公开）",
            cell: (h, { row }) => {
              return row[this.currentTab === "拟不在党内公开" ?'OrgUnpublishMap':'SocietyUnpublishMap' ]?.issueNoPublic || "-";
            },
          },
          {
            title: "拟不公开理由",
            cell: (h, { row }) => {
              return row[this.currentTab === "拟不在党内公开" ?'OrgUnpublishMap':'SocietyUnpublishMap' ]?.issueNoPublicReason || "-";
            },
          },
          { colKey: "problemCompletionOverview", title: "具体问题整改落实情况（原文）" },
          {
            title: "具体问题整改落实情况（拟不公开）",
            cell: (h, { row }) => {
              return row[this.currentTab === "拟不在党内公开" ?'OrgUnpublishMap':'SocietyUnpublishMap' ]?.issueRectificationNoPublic || "-";
            },
          },
          {
            title: "不公开理由",
            cell: (h, { row }) => {
              return row[this.currentTab === "拟不在党内公开" ?'OrgUnpublishMap':'SocietyUnpublishMap' ]?.issueRectificationNoPublicReason || "-";
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
                      click: () =>
                        this.openMeasureDrawer("check-unpublish", row.id),
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
        label: "公开整改情况",
        value: "PublicRectificationSituationNode-situation",
        needSidebar: false,
        headerBtns: [
          {
            label: "新增",
            event: () => {
              console.log("点击了新增按钮");
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
                    on: { click: () => this.handleEdit(row) },
                  },
                  "编辑"
                ),
              ]);
            },
          },
        ],
      },
    ],
  };
}
