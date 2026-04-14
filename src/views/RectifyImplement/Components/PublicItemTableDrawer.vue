<template>
  <t-drawer :visible.sync="localVisible" header="编辑" @close="handleClose" size="50%">
    <div class="drawer-content">
      <div class="drawer-item" v-for="(item, index) in rowData" :key="index">
        <ModulerHeader :title="item.subMattersName" class="item-title"></ModulerHeader>
        <t-table class="matters-table" rowKey="id" :data="item.meetList" :columns="columns">
        </t-table>
      </div>
    </div>
  </t-drawer>
</template>

<script>
export default {
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      localVisible: this.visible,
      rowData: [
        {
          subMattersName: "整改专题会议",
          orderIndex: 471,
          meetList: [
            {
              id: "1938132141191925761",
              riInfoId: "1916320356772364289",
              mattersId: "21",
              matters: "SPECIAL_MEET_CONVENE",
              subMattersName: "整改专题会议",
              fileName: "测试文件上传.doc",
              currentVersion: 1,
              currentVersionName: "第1版",
              uploadTime: "2025-06-26",
              processInstanceId: null,
              completeStatus: 0,
              status: 0,
              responsibleDepartmentId: "INSPECTION_OFFICE",
              auditSign: 0,
              deleteSign: 1,
              meetFile: {
                id: "1938132141250646017",
                createTime: "2025-06-26 15:08:05",
                createId: "1821020396603166721",
                updateTime: "2025-06-26 15:08:05",
                updateId: "1821020396603166721",
                delFlag: 0,
                nodeCode: "SpecialMeetNode",
                businessType: "SpecialMeetNode",
                businessId: "1938132141191925761",
                fileId: "1938132043661774848",
                fileName: "测试文件上传",
                suffix: "doc",
                officeId: "1820743430515728385",
                secretType: "internal",
                riInfoId: "1916320356772364289",
              },
            },
          ],
        },
        {
          subMattersName: "其他",
          orderIndex: 481,
          meetList: [],
        },
      ],
    };
  },

  watch: {
    // 父组件更新 visible 时同步到本地
    visible(newVal) {
      this.localVisible = newVal;
    },
  },
  computed: {
    columns() {
      return [
        {
          colKey: "serial-number",
          align: "center",
          width: 80,
          title: "序号",
        },
        {
          colKey: "fileName",
          title: "具体表现",
          width: "220",
          ellipsis: true,
        },
        {
          colKey: "asd",
          title: "整改落实目标",
        },
        {
          colKey: "sdf",
          title: "措施数量",
        },
        {
          colKey: "wqe",
          title: "完成情况",
        },
        {
          colKey: "xcv",
          title: "完成时间",
        },
        {
          title: '操作栏',
          colKey: 'operate',
          width: 150,
          cell: (h, { row }) => {
            return h('div', { class: 'table-operations' }, [
              h('t-link', {
                props: { theme: 'primary', hover: 'color' },
                attrs: { 'data-id': row.key },
                on: { click: () => console.log('点击了编辑按钮', row.key) }
              }, '查看')

            ]);
          }
        }
      ];
    },
  },
  mounted() { },
  methods: {
    handleClose() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="less" scoped>
.drawer-content {
  padding: 0 16px;
}
</style>
