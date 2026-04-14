export const NODE_CODE_MAP = {
  RectificationPlanNode: "RectificationPlanNode",
  FeedbackMeetNode: "FeedbackMeetNode",
  FeedbackMeetAdviceNode: "FeedbackMeetAdviceNode",
  SubsequentRectificationReportNode: "SubsequentRectificationReportNode",
  RectificationReportNode: "RectificationReportNode",
  ConcentratedRectificationNode: "ConcentratedRectificationNode",
  PublicRectificationSituationNode: "PublicRectificationSituationNode",
  SubsequentRectificationNode: "SubsequentRectificationNode", // 后续整改
  SpecialMeetNode: "SpecialMeetNode",
  DemocraticLifeAssociationNode: "DemocraticLifeAssociationNode",
  RectificationEvaluationNode: "RectificationEvaluationNode",
};

export const CHECKABLE_NODES = [
  NODE_CODE_MAP.RectificationPlanNode,
  NODE_CODE_MAP.FeedbackMeetNode,
  NODE_CODE_MAP.FeedbackMeetAdviceNode,
  NODE_CODE_MAP.SubsequentRectificationReportNode,
  NODE_CODE_MAP.RectificationReportNode,
  NODE_CODE_MAP.ConcentratedRectificationNode,
  NODE_CODE_MAP.PublicRectificationSituationNode,
  NODE_CODE_MAP.SubsequentRectificationNode,
  NODE_CODE_MAP.RectificationEvaluationNode,
  NODE_CODE_MAP.DemocraticLifeAssociationNode,
  NODE_CODE_MAP.SpecialMeetNode,
];
export const COMPLETE_SITUATION_LIST = [
  {
    label: "全选",
    checkAll: true,
    value: "-1",
  },
  {
    label: "未完成",
    value: "0",
  },
  {
    label: "基本完成",
    value: "1",
  },
  {
    label: "已完成",
    value: "2",
  },
];
// export const HIDDEN_HISTORY_CHECK_NODES = [
//   NODE_CODE_MAP.RectificationPlanNode, //1
//   NODE_CODE_MAP.RectificationReportNode, //2
//   NODE_CODE_MAP.SubsequentRectificationReportNode, //3
// ];

export const FILE_LEVEL_MAP = {
  public: {
    label: "公开",
    value: "public",
  },
  internal: {
    label: "内部",
    value: "internal",
  },
  secret: {
    label: "秘密",
    value: "secret",
  },
  confidential: {
    label: "机密",
    value: "confidential",
  },
};

export const NODE_FLOW_MAP = {
  RI_FEEDBACK_MEET: "RI_FEEDBACK_MEET", // 反馈会
  RI_OPEN_FEEDBACK: "RI_OPEN_FEEDBACK", // 公开反馈意见审批流程
  RI_THEMATIC_MEET: "RI_THEMATIC_MEET", // 专题会议审批流程
  RI_RECTIFICATION_PLAN: "RI_RECTIFICATION_PLAN", // 整改方案
  RI_RECTIFICATION_PLAN_QUESTIONS: "RI_RECTIFICATION_PLAN_QUESTIONS", // 整改方案-问题清单
  CONCENTRATED_RECTIFICATION: "CONCENTRATED_RECTIFICATION", // 集中整改-问题清单
  RI_RECTIFICATION_REPORT: "RI_RECTIFICATION_REPORT", // 整改情况报告
  RI_RECTIFICATION_REPORT_QUESTIONS: "RI_RECTIFICATION_REPORT_QUESTIONS", // 整改情况报告-问题清单
  RI_DEMOCRACY_MEET: "RI_DEMOCRACY_MEET", // 民主生活会审批流程
  RI_RECTIFICATION_DISCLOSURE: "RI_RECTIFICATION_DISCLOSURE", // 公开整改情况审批流程
  RI_RECTIFICATION_CONCLUSION: "RI_RECTIFICATION_CONCLUSION", // 整改结论-问题清单
  RI_RECTIFICATION_SUBSEQUENT: "RI_RECTIFICATION_SUBSEQUENT", // 后续整改
  RI_RECTIFICATION_SUBSEQUENT_REPORT: "RI_RECTIFICATION_SUBSEQUENT_REPORT", // 后续整改报告
  RI_RECTIFICATION_SUBSEQUENT_REPORT_QUESTIONS:
    "RI_RECTIFICATION_SUBSEQUENT_REPORT_QUESTIONS", // 后续整改报告-问题清单
};
export const HIDDEN_HISTORY_CHECK_NODES = [
  NODE_FLOW_MAP.RI_RECTIFICATION_PLAN, //1
  NODE_FLOW_MAP.RI_RECTIFICATION_REPORT, //1
  NODE_FLOW_MAP.RI_RECTIFICATION_SUBSEQUENT_REPORT, //1
];
export const COMPLETE_STATUS_MAP = {
  2: "已完成",
  1: "基本完成",
  0: "未完成",
};

export const DEFAULT_STATIC_QUERY = {
  focusConcernSize: false,
  measuresCollectionSize: true,
  measuresCompleteSize: false,
  measuresSize: false,
  queryOftenInsistSize: true,
  questionsBasicCompletionSize: true,
  questionsCompleteSize: true,
  questionsNoCompletionSize: true,
  questionsSize: false,
};

export const REQUIRED_MATTERS = [
  "FEEDBACK_COMMENTS",
  "FEEDBACK_WORK_PROGRAMME",
  "FEEDBACK_WORK_PROGRAMME_SITUATION",
  // "ADVICE_NEWS",
  "ADVICE_PARTY_REPORT",
  "ADVICE_PARTY_PUBLIC_SENTIMENT",
];
