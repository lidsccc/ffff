/** pin消息type */
export enum PinType {
  /**全部 */
  ALL = 1,
  /** 已回执 */
  REPEATED = 2,
  /** 未回执 */
  UNREPEAT = 3,
  /** 我发出的 */
  SENT = 4,
}
/**导航title */
export enum PinNavListType {
  ALL = "全部",
  UNFINISHED = "未回执",
  FINISHED = "已回执",
  SENT = "我发出的",
}
/**pin提醒方式 */
export enum noticeOptionType {
  App = "1",
  Message = "2",
  Phone = "3",
}
/**pin当前回复状态 */
export enum selfReceiptedType {
  /**无需回执 */
  Noneed = -1,
  /**未回执 */
  Unreceipt = 0,
  /**已回执 */
  Receipted = 1,
}
