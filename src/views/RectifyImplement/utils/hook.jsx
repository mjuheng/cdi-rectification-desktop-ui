import apis from "@/service";
import store from "@/store";
import { DialogPlugin, MessagePlugin } from "tdesign-vue";
import { checkAuthIsExist } from "@/utils";
export const useGetDepartmentFormItem = async (
  attrs,
  field = "responsibleDepartmentId"
) => {
  const {
    attrs: { officeName, officeId },
  } = attrs;
  const formItem = {
    label: "责任部门",
    name: field,
    type: "select",
    defaultValue: officeId,
    disabled: true,
    fieldProps: {
      options: [{ officeName, officeId }],
      keys: { label: "officeName", value: "officeId" },
    },
  };
  return checkAuthIsExist("HB_PORT") ? [] : formItem;
};

export const useGetPublicFormItem = async (field = "publicForm") => {
  await store.dispatch("common/GET_DICT", ["PublicType"]);
  const publicTypes = store.state.common.dictMap.PublicType;
  const formItem = {
    label: "公开形式",
    name: field,
    type: "select",
    rules: [{ required: true, trigger: "change", message: `请选择公开形式` }],
    fieldProps: {
      options: publicTypes,
      keys: { label: "dicValueName", value: "dicValueCode" },
    },
  };
  return formItem;
};

export const useSubmitAudit = async (content, flowCode, api) => {
  const { attrs, fns, code } = content;
  const {
    selected,
    questionsSpecial,
    matterId: riInfoId,
    data: { list },
  } = attrs;
  const { loadPage } = fns;
  const { nodeCode } = code;
  const isAll = !selected || !selected.length;
  const msg = isAll ? "全部" : "选中";
  const canPushDatas = selected?.length
    ? list.filter(
        (s) => selected.includes(s.id) && (s.status == 0 || s.status == 3)
      )
    : [];
  // 无可提交数据
  if (!canPushDatas.length && selected?.length)
    return MessagePlugin.warning("未选择可提交数据");
  const param = isAll
    ? {
        flowCode,
        ids: [],
        nodeCode,
        questionsSpecial,
        riInfoId,
      }
    : {
        flowCode,
        nodeCode,
        ids: selected,
        questionsSpecial,
        riInfoId,
      };
  const confirmDia = DialogPlugin.confirm({
    theme: "info",
    header: "提交",
    body: `是否提交${msg}数据？`,
    confirmBtn: "确定",
    cancelBtn: "取消",
    onConfirm: async () => {
      const queryFunc = api || apis.workflow.workflowSubmit;
      await queryFunc(param);
      MessagePlugin.success("提交成功");
      confirmDia.destroy();
      loadPage?.();
    },
  });
};

export const useStatusCell = (types) => {
  return {
    cell: (h, { row }) => {
      const classMap = {
        0: "not-complete",
        1: "review-pass",
        2: "wait-review",
        3: "review-fail",
        4: "complete",
        5: "wait-review",
      };
      return (
        <div class={`status-cell is-${classMap[row.status]}`}>
          {types[row.status]}
        </div>
      );
    },
  };
};
export const useOthersStatusCell = (types, key) => {
  return {
    cell: (h, { row }) => {
      const classMap = {
        0: "not-complete",
        1: "review-pass",
        2: "wait-review",
        3: "review-fail",
        4: "complete",
      };
      return (
        <div class={`status-cell is-${classMap[row[key]]}`}>
          {types[row[key]]}
        </div>
      );
    },
  };
};
