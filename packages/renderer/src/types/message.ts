export enum MessageContentType {
  Text = 0, // 普通文本
  Image = 1, // 图片
  Audio = 2, // 音频
  Video = 3, // 视频
  Location = 4, // 定位
  File = 5, // 文件
  Article = 6, // 文章
  Merger = 7, // 合并消息
  GROUP_NOTICE = 8, // 群通知
  Custom = 100, // 自定义
}

/** 群通知类型 */
export enum GroupNoticeMode {
  /** 解散群 */
  GROUP_DISBANDED = 1,
  /** 退群 */
  MEMBER_LEFT = 2,
  /** 踢人 */
  MEMBER_KICKED_OFF = 3,
  /** 加入 */
  MEMBER_JOINED = 4,
  /** 公告 */
  GROUP_ANNOUNCED = 5,
  /** 转让群主 */
  LEADER_CHANGED = 6,
  /** 转让管理员 */
  MAINTAINER_CHANGED = 7,
  /** 移除管理员 */
  MAINTAINER_REMOVED = 8,
  /** 修改群名称 */
  GROUP_NAME_CHANGED = 9,
  /** 邀请进群 */
  MEMBER_INVITED = 10,
}

// 自定义消息类型
// 与移动端保持一致
export enum CustomMessageType {
  MSG_WITH_QUOTED_MSG = "message_with_quoted_message", // 引用消息
  VIDEO_CALL_REQUEST = "video_call_request", // 音视频邀请消息
  SHARE_BUSINESS_CARD = "share_business_card", // 名片消息
  POST_NEW_GROUP_OWNER = "post_new_group_owner", // 更新群主
  SUCCEED_IN_CREATING_GROUP = "succeed in creating group", // 新建群
}

export enum VideoCallResult {
  REJECT = "reject", // 拒绝邀请
  ACCEPT = "accept", // 接受邀请
  PRIVATE_HANG_UP = "private_hang_up", // 单聊挂断
}

export enum MessageReceiveType {
  Personal = 0, //个人消息
  Group = 1, //群组消息
}

export enum MessageSendStatus {
  ToSend = 0, // 未发送
  Sending = 1, // 正在发送
  Sended = 2, // 已发送
  Failed = 3, // 发送失败
  Recall = 4, // 已撤回
}

export enum MessageActionType {
  Push = 0, // 推送消息
  Read = 1, // 推送已读回执
  Withdraw = 2, // 推送撤回消息
  Sync = 3, // 推送同步消息
  At = 4, // 推送@消息
}

// 会话类型
export enum ConversationType {
  IM_CVS_TYPE_C2C = 0, // 单聊
  IM_CVS_TYPE_GROUP = 1, // 群聊
}

export enum MessageEvent {
  GroupChat = "system.msg.im.groupchat", // 群聊
  M2MChat = "system.msg.im.m2mchat", // 单聊
}

export enum HasAnyoneCare {
  No = 0,
  Me = 1,
  All = 2,
  Me_And_All = 3,
}

export interface Conversation {
  conversationAvatar: string;
  conversationId: string;
  conversationName: string;
  conversationType: ConversationType;
  draftText: string;
  draftTimestamp: number;
  hasAnyoneCare: HasAnyoneCare;
  lastMsg: Message;
  lastMsgId: string;
  lastSendTime: number;
  markAsUnread: boolean;
  newGroupAnnouncement: boolean;
  noInform: boolean;
  numOfNotReadMsg: number;
  onTop: number;
  orderKey: number;
  messageContentList?: Message[];
  isOfficial: number; // 是否是部门群
}

export interface Message {
  content?: any;
  from: string;
  hasRead?: number;
  otherSideRead?: number; //对端消息是否已读
  msgStatus?: MessageSendStatus;
  mid?: string;
  msgType?: MessageContentType;
  notify?: boolean;
  recvType?: MessageReceiveType;
  sendTime?: number;
  seq?: number;
  to?: string;
  avatar?: string;
  name?: string;
  event?: string;
}

export enum ForwardType {
  /** 单一转发 */
  Single = 1,
  /** 逐一转发 */
  OneByOne = 2,
  /** 合并转发 */
  Together = 3,
}

export interface VideoCallRequestMessageContent {
  type: string;
  isAudioCall: boolean;
  isGroup: boolean;
  targetId: string;
  replyId: string;
  inviteeIds: string[];
}

export enum MessageOperationStatus {
  Input = "input",
  Select = "select",
}
