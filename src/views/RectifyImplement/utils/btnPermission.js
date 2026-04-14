import { CHECKABLE_NODES } from "./constant";
import { checkAuthIsExist } from "@/utils";
// 内置按钮显隐逻辑
export function regularBtnPermission(row, config, attrs) {
  const { roleType } = attrs;
  return {
    canAudit:
      row.status == 2 &&
      (row.canReview || row.canReview == undefined) &&
      CHECKABLE_NODES.includes(config.code),
    canEdit: row.status == 0 || row.status == 3,
    canDelete: checkAuthIsExist("HB_PORT") ? true : row.status == 0,
    isOpen: attrs.isCurrentOpen === true,
    isConfirm:
      checkAuthIsExist("RI_STEP_CONFIRM_BTN") && config.confirmNode === 1,
    ...roleType,
  };
}
