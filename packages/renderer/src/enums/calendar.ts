export enum CreateCalendarType {
  /** 日程 */
  Schedule = 1,
  /** 会议 */
  Meeting = 2,
}

export enum MeetingRepeatType {
  Once = 0,
  Day = 1,
  Week = 2,
  Month = 3,
  Year = 4,
  WorkDay = 5,
  Custom = 6,
}
/**日程提醒方式 */
export enum RemindType {
  App = "1",
  Message = "2",
  Phone = "3",
}
/** 用户是否已接受日程或拒绝日程 */
export enum UserCalendarStatus {
  Todo = 0, // 待定
  Accept = 1,
  Refuse = 2,
}
/** 共享日程编辑角色 */
export enum ShareType {
  subscribe = 1,
  edit = 0,
}
