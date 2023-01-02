export const timeTypeOptions = [
  { label: "定时发送", value: true },
  { label: "立即发送", value: false },
];
export const remindTimeOptions = [
  { label: "未回执不提醒", value: "" },
  { label: "未回执五分钟后，再次提醒", value: 300000 },
  { label: "未回执十分钟后，再次提醒", value: 600000 },
  { label: "未回执十五分钟后，再次提醒", value: 900000 },
];

// pin消息提醒种类
export const noticeOption = {
  App: "App",
  Phone: "Phone",
  Message: "Message",
  AppAndMessage: "AppAndMessage",
  AppAndPhone: "AppAndPhone",
};

export const noticeTypeOptions = [
  { label: "应用", value: noticeOption.App },
  { label: "应用+短信", value: noticeOption.AppAndMessage },
  { label: "应用+电话", value: noticeOption.AppAndPhone },
];
