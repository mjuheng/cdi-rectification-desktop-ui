// FeedbackMeetNode 配置文件
// 用于配置CommonRender组件所需的各种参数
export function getConfig() {
  return {
    // 页面标题
    name: "反馈会",
    // 标签页配置
    tabs: [
      {
        label: "反馈会",
        value: "FeedbackMeetNode-feedback",
        needSidebar: false,
        headerBtns: [
          // {
          //   label: "新增反馈",
          //   event: function () {
          //     console.log("点击了新增反馈按钮");
          //   },
          // },
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
                    on: {
                      click: () => {
                        this.handleOpenMatterDrawer(row.id);
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
        label: "反馈问题清单",
        value: "FeedbackMeetNode-problemList",
        needSidebar: true,
        headerBtns: [
          {
            label: "导入",
            event: () => {
              this.handleImport();
            },
          },
          {
            label: "新增反馈",
            event: () => {
              this.handleOpenFormDrawer("add");
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
          { colKey: "questionsContent", title: "具体问题内容" },
          { colKey: "performanceContent", title: "具体表现内容" },
          { colKey: "questionsSpecial", title: "问题专项" },
          { colKey: "correspondingContent", title: "对应四落" },
          { colKey: "focusConcern", title: "是否重点关注" },
          { colKey: "questionsType", title: "问题类别" },
          { colKey: "questionsSubclass", title: "问题子类" },
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
                    style: { marginRight: "16px" },
                    on: {
                      click: () => {
                        this.handleOpenFormDrawer("edit", row.id);
                      },
                    },
                  },
                  "编辑"
                ),
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
