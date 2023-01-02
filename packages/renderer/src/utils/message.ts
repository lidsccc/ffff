import {
  Message,
  MessageContentType,
  CustomMessageType,
  VideoCallResult,
} from "@/types/message";
import { get, isString } from "lodash-es";

// 判断是否是引用消息
export const isQuotedMessage = (message: Message) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { type } = JSON.parse(content.data);
      return type === CustomMessageType.MSG_WITH_QUOTED_MSG;
    } catch (err: any) {
      window.$log.error("解析自定义消息体异常", err);
      return false;
    }
  }
  return false;
};

// 判断是否是音视频邀请的通知消息
export const isVideoCallRequestMessage = (message: Message) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { type } = JSON.parse(content.data);
      return type === CustomMessageType.VIDEO_CALL_REQUEST;
    } catch (err: any) {
      window.$log.error("解析自定义消息体异常", err);
      return false;
    }
  }
  return false;
};

export const isVideoCallReject = (message: Message) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { type } = JSON.parse(content.data);
      return type === VideoCallResult.REJECT;
    } catch (err: any) {
      window.$log.error("解析自定义消息体异常", err);
      return false;
    }
  }
  return false;
};

export const isVideoCallAccept = (message: Message) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { type } = JSON.parse(content.data);
      return type === VideoCallResult.ACCEPT;
    } catch (err: any) {
      window.$log.error("解析自定义消息体异常", err);
      return false;
    }
  }
  return false;
};

// 获取回复引用消息的消息内容
export const getQuotedMessageContent = (message: Message) => {
  let res;
  try {
    const { data } = JSON.parse(message.content);
    // console.log("获取回复引用消息的消息内容1", data);
    const content = JSON.parse(data);
    // console.log("获取回复引用消息的消息内容2", content);
    const quotedMsg = JSON.parse(content.quotedMsg);
    // console.log("获取回复引用消息的消息内容3", quotedMsg);
    res = { ...content, quotedMsg };
  } catch (err: any) {
    window.$log.error("获取回复引用消息的消息内容4", message, err);
    res = {};
  }
  return res;
};

// 获取自定义消息的消息内容
export const getCustomMessageContent = (message: Message) => {
  let content;
  try {
    content = JSON.parse(get(message, "content.data"));
  } catch (err: any) {
    content = {};
  }
  return content;
};

// 获取消息体中的消息内容
export const getMessageContent = (message: Message) => {
  let content;
  switch (message.msgType) {
    case MessageContentType.Text:
      try {
        const { text } = JSON.parse(message.content);
        content = text;
      } catch {
        content = "";
      }
      break;
    case MessageContentType.Custom:
      if (isQuotedMessage(message)) {
        content = getQuotedMessageContent(message);
      } else {
        content = "";
      }
      break;
    default:
      content = "";
  }
  return content;
};

// 名片消息
export const isBusinessCardMessage = (message: any) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { type } = JSON.parse(content.data);
      return type === CustomMessageType.SHARE_BUSINESS_CARD;
    } catch (err: any) {
      window.$log.error("解析名片的自定义消息体异常", err);
      return false;
    }
  }
  return false;
};

// 任务通知消息
export const isTaskMessage = (message: any) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { category } = JSON.parse(content.data);
      return category === "ROBOT_TASK";
    } catch (err: any) {
      window.$log.error("解析任务通知消息体异常", err);
      return false;
    }
  }
  return false;
};

// 日程通知消息
export const isAgendaMessage = (message: any) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { category } = JSON.parse(content.data);
      return category === "ROBOT_AGENDA";
    } catch (err: any) {
      window.$log.error("解析日程通知消息体异常", err);
      return false;
    }
  }
  return false;
};

// Pin通知消息
export const isPinMessage = (message: any) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { category } = JSON.parse(content.data);
      return category === "ROBOT_PIN";
    } catch (err: any) {
      window.$log.error("解析Pin通知消息体异常", err);
      return false;
    }
  }
  return false;
};

// 获取消息预览
export const getMessagePreview = (message: any) => {
  let content: any;
  try {
    content = JSON.parse(message?.content);
    if (isString(content)) {
      content = JSON.parse(content);
    }
  } catch (err: any) {
    window.$log.error("getMessagePreview parse error", err, message);
    return "";
  }
  switch (message.msgType) {
    case MessageContentType.Text:
      return content.text || "";
    case MessageContentType.Image:
      return "[图片]";
    case MessageContentType.Audio:
      return "[音频]";
    case MessageContentType.Video:
      return "[视频]";
    case MessageContentType.File:
      return `[文件]${content.name || ""}`;
    case MessageContentType.Location:
      try {
        const { description = "" } = JSON.parse(content.name);
        return `[定位]${description}`;
      } catch {
        return "[定位]";
      }
    case MessageContentType.Article:
      return `[文章]${content.name || ""}`;
    case MessageContentType.Merger:
      return "[聊天记录]";
    case MessageContentType.Custom:
      return "[自定义消息]";
    case MessageContentType.GROUP_NOTICE:
      return "";
    default:
      return "[未知]";
  }
};

// 是否是群通知消息
export const isGroupNotify = (message: any) => {
  if (message.msgType === MessageContentType.Custom) {
    try {
      const content = JSON.parse(message.content);
      if (!content.data) return false;
      const { type } = JSON.parse(content.data);
      return [
        CustomMessageType.POST_NEW_GROUP_OWNER,
        CustomMessageType.SUCCEED_IN_CREATING_GROUP,
      ].includes(type);
    } catch (err: any) {
      window.$log.error("解析群组通知的自定义消息体异常", err);
      return false;
    }
  }
  return false;
};

export const checkIsRobot = (id: string) => id.startsWith("ROBOT_");
