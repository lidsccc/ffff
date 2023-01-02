import { MeetingRepeatType, RemindType, ShareType } from "@/enums/calendar";

export const remindTimeOptions = [
  { label: "不提醒", value: "|", type: 0 },
  { label: "事件发生时", value: "subMinutes|0", type: 1 },
  { label: "提前5分钟", value: "subMinutes|5", type: 2 },
  { label: "提前15分钟", value: "subMinutes|15", type: 3 },
  { label: "提前30分钟", value: "subMinutes|30", type: 4 },
  { label: "提前1小时", value: "subMinutes|60", type: 5 },
  { label: "提前2小时", value: "subMinutes|120", type: 6 },
  { label: "提前1天", value: "subDays|1", type: 7 },
  { label: "提前2天", value: "subDays|2", type: 8 },
  { label: "提前1周", value: "subDays|7", type: 9 },
];

export const alldayRemindTimeOptions = [
  { label: "前一天8点", value: "subHours|16", type: 0 },
  { label: "前一天9点", value: "subHours|15", type: 1 },
  { label: "前一天10点", value: "subHours|14", type: 2 },
  { label: "当天8点", value: "addHours|8", type: 3 },
  { label: "当天9点", value: "addHours|9", type: 4 },
  { label: "当天10点", value: "addHours|10", type: 5 },
];

export const repeatTypeOptions = [
  { label: "不重复", value: MeetingRepeatType.Once },
  { label: "每天", value: MeetingRepeatType.Day },
  { label: "每周", value: MeetingRepeatType.Week },
  { label: "每月", value: MeetingRepeatType.Month },
  { label: "每年", value: MeetingRepeatType.Year },
  { label: "每周的工作日", value: MeetingRepeatType.WorkDay },
  { label: "自定义周期", value: MeetingRepeatType.Custom },
];
export const remindTypeOptions = [
  { label: "应用内提醒", value: RemindType.App },
  { label: "短信提醒", value: RemindType.Message },
  { label: "电话提醒", value: RemindType.Phone },
];
export const calendarDurationOptions = [
  { label: "15分钟", type: 0 },
  { label: "30分钟", type: 1 },
  { label: "45分钟", type: 2 },
  { label: "60分钟", type: 3 },
  { label: "90分钟", type: 4 },
  { label: "120分钟", type: 5 },
];

export const meetingRepeatOptions = [
  { label: "天", value: MeetingRepeatType.Day },
];

export const calendarShareOptions = [
  { label: "订阅者", value: ShareType.subscribe },
  { label: "编辑者", value: ShareType.edit },
];
