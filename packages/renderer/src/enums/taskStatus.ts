/** 任务状态 */
export enum TaskType {
  /** 正在进行的所有任务 */
  ALL = 3,
  /** 我参与的 */
  JOIN = 0,
  /** 我创建的 */
  MANAGE = 1,
  /** 我关注的 */
  RECEIVED = 2,
}

/** 已结束任务 */
export enum FinishedType {
  /** 已结束的全部任务 */
  ALL = 4,
  /** 未完成 */
  UNFINISHED = 0,
  /** 已完成 */
  FINISHED = 1,
  /** 已关闭 */
  SHUTDOWN = 2,
  /** 已逾期 */
  DELAYED = 3,
}
/** 任务状态的标签内容 */
export enum taskStatusTagContent {
  Delay = "已逾期",
  Unfinished = "进行中",
  Finished = "已完成",
  Shutdown = "已终止",
}
/**任务协作导航 */
export enum NavListType {
  DOING = "我的待办",
  // JOIN = "我参与的",
  MANAGE = "我创建的",
  RECEIVED = "我关注的",
  FINISHED = "我的已办",
}

/**导航栏id */
export enum NavListId {
  Doing = "doing",
  Join = "take",
  Create = "create",
  Share = "share",
  Done = "done",
}
/** 任务排序 */
export enum TaskSort {
  /** 按创建时间排序   */
  CreatSort = 0,
  /** 按截止时间排序 */
  CloseSort = 1,
  /** 按更新时间排序 */
  UpdateSort = 2,
}
/**主任务操作 */
export enum HandleTaskType {
  History = "history",
  Cancel = "cancel",
  Finish = "finish",
}
/** 任务操作类型*/
export enum TaskActionType {
  /** 发送   */
  Send = 0,
  /** 关闭  */
  Close = 1,
  /** 催办*/
  Urge = 2,
  /** 完成   */
  Finish = 3,
  /** 更新   */
  Update = 4,
  /**逾期   */
  Exceed = 5,
  /** 滞后   */
  Delay = 6,
  /**关注  */
  Follow = 7,
}
