import { defineStore } from "pinia";
import { get } from "lodash-es";
import {
  Message,
  VideoCallRequestMessageContent,
  VideoCallResult,
  Conversation,
  ConversationType,
  MessageSendStatus,
  MessageEvent,
  MessageReceiveType,
} from "@/types/message";
import {
  BasicUserDetail,
  BasicGroupDetail,
  BasicRobotDetail,
} from "@/types/user";
import {
  detailRobot,
  detailGroupV2,
  listDetailGroup,
  listDetailRobot,
} from "@/api/message";
import { detailUser, listDetailUser } from "@/api/user";
import { useUserStore } from "./user";
import { checkIsRobot } from "@/utils/message";
// import { IMAGE_TO_BASE64 } from "@/../../main/channel";

export const useMessageStore = defineStore({
  id: "message", // id 必填且需要唯一

  state: (): {
    conversationList: any[];
    activeRecordId: string;
    referenceMessage: any;
    audioAndVideoCallRequestMessageContent: null | VideoCallRequestMessageContent;
    isAudioAndVideoCallRequestVisible: boolean;
    isAudioAndVideoCallDialogVisible: boolean;
    isAudioAndVideoCallSmallDialogVisible: boolean;
    audioAndVideoCallRequestTimer: any | NodeJS.Timer;
    audioAndVideoCallStartTime: null | Date;
    nameAndAvatarMap: Map<string, { name: string; avatar: string }>;
    messageLoading: { [key: string]: boolean };
    isConversationLoading: boolean;
    messageTransmissionPercentage: Object; //消息进度条
  } => {
    return {
      conversationList: [],
      activeRecordId: "",
      referenceMessage: null,
      audioAndVideoCallRequestMessageContent: null,
      isAudioAndVideoCallRequestVisible: false,
      isAudioAndVideoCallDialogVisible: false,
      isAudioAndVideoCallSmallDialogVisible: false,
      audioAndVideoCallRequestTimer: null,
      audioAndVideoCallStartTime: null,
      nameAndAvatarMap: new Map(),
      messageLoading: {},
      isConversationLoading: false,
      messageTransmissionPercentage: {},
    };
  },

  getters: {
    activeRecordItem: (state) => {
      const activeItem =
        state.conversationList.find(
          (item: { conversationId: string }) =>
            item.conversationId === state.activeRecordId
        ) || {};
      return activeItem;
    },
  },

  actions: {
    //更新发送文件进度
    updateMessageTransmissionPercentage(mid: string, percentage: number) {
      if (percentage >= 100) {
        delete this.messageTransmissionPercentage[mid];
      } else {
        this.messageTransmissionPercentage[mid] = percentage;
      }
    },
    setActiveRecordId(id: string) {
      this.activeRecordId = id;
    },
    setReferenceMessage(msg: any) {
      this.referenceMessage = msg;
    },
    // 删除会话
    deleteConversation(conversationId: any) {
      this.conversationList = this.conversationList.filter(
        (item) => item.conversationId !== conversationId
      );

      if (this.activeRecordId === conversationId) {
        // 删除的是当前选中的消息
        this.activeRecordId = "";
      }
    },
    // 更新缓存头像、名称
    async updateNameAndAvatarCache(
      id: string,
      val: { name: string; avatar: string; isOfficial?: number }
    ) {
      this.nameAndAvatarMap.set(id, val);
      // 更新全局base64缓存
      // const base64 = await window.ipcRenderer.invoke(
      //   IMAGE_TO_BASE64,
      //   val.avatar
      // );
      // window.__GLOBAL_AVATAR_CACHE__[
      //   val.avatar
      // ] = `data:image/png;base64,${base64}`;
    },
    // id和名称、头像缓存
    async getNameAndAvatar(
      id = "",
      conversationType = ConversationType.IM_CVS_TYPE_C2C
    ): Promise<{ avatar: string; name: string; isOfficial?: number }> {
      const isGroup = conversationType === ConversationType.IM_CVS_TYPE_GROUP;
      const isRobot = checkIsRobot(id);
      if (!id) {
        return {
          avatar: "",
          name: "",
        };
      }
      const res = this.nameAndAvatarMap.get(id);
      if (res) {
        return res;
      }
      if (isRobot) {
        // 机器人
        try {
          const { name = "", iconUrl = "" } = await detailRobot(id);
          const robotDetail = {
            avatar: iconUrl,
            name,
          };
          this.nameAndAvatarMap.set(id, robotDetail);
          return robotDetail;
        } catch (err) {
          window.$log.error("查询机器人异常", err);
          return {
            avatar: "",
            name: "",
          };
        }
      }
      if (isGroup) {
        // 群聊
        const userStore = useUserStore();
        try {
          const {
            groupName = "",
            iconUrl = "",
            isOfficial,
          } = await detailGroupV2({
            groupId: id,
            userId: userStore.userId,
          });
          const groupDetail = {
            avatar: iconUrl,
            name: groupName,
            isOfficial,
          };
          this.nameAndAvatarMap.set(id, groupDetail);
          return groupDetail;
        } catch (err) {
          window.$log.error("查询群组异常", err);
          return {
            avatar: "",
            name: "",
            isOfficial: 0,
          };
        }
      }
      // 单聊
      try {
        const { name = "", iconUrl = "" }: any = await detailUser({
          id,
        });
        const userDetail = {
          avatar: iconUrl,
          name,
        };
        this.nameAndAvatarMap.set(id, userDetail);
        return userDetail;
      } catch (err) {
        window.$log.error("查询用户异常", err);
        return {
          avatar: "",
          name: "",
        };
      }
    },
    // 批量查用户名称、头像
    async batchFetchUserDetail(userIds: string[]): Promise<BasicUserDetail[]> {
      return listDetailUser({ userIds })
        .then(({ items }) => items)
        .catch(() => []);
    },
    // 批量查群名称、头像
    async batchFetchGroupDetail(
      groupIds: string[]
    ): Promise<BasicGroupDetail[]> {
      return listDetailGroup({ groupIds })
        .then(({ items }) => items)
        .catch(() => []);
    },
    // 批量查机器人名称、头像
    async batchFetchRobotDetail(
      robotIds: string[]
    ): Promise<BasicRobotDetail[]> {
      return listDetailRobot({ robotIds })
        .then(({ items }) => items)
        .catch(() => []);
    },
    // 获取用户名称、头像或者群名称、头像
    async fetchConversationNameAndAvatar(conv: Conversation) {
      const {
        conversationId,
        conversationType,
        conversationAvatar,
        conversationName,
      } = conv;
      const {
        name,
        avatar,
        isOfficial = 0,
      } = await this.getNameAndAvatar(conversationId, conversationType);
      return {
        conversationAvatar: avatar || conversationAvatar,
        conversationName: name || conversationName,
        isOfficial,
      };
    },
    async updateConversationAvatarAndName(list: Conversation[]) {
      const userIds: string[] = [];
      const groupIds: string[] = [];
      const robotIds: string[] = [];

      list.forEach(({ conversationId, conversationType }: any) => {
        if (checkIsRobot(conversationId)) {
          robotIds.push(conversationId);
        } else if (conversationType === ConversationType.IM_CVS_TYPE_C2C) {
          userIds.push(conversationId);
        } else {
          groupIds.push(conversationId);
        }
      });

      console.log("userIds", userIds);
      console.log("groupIds", groupIds);
      console.log("robotIds", robotIds);

      let userList: BasicUserDetail[] = [];
      let groupList: BasicGroupDetail[] = [];
      let robotList: BasicRobotDetail[] = [];
      if (userIds.length) {
        userList = await this.batchFetchUserDetail(userIds);
      }
      if (groupIds.length) {
        groupList = await this.batchFetchGroupDetail(groupIds);
      }
      if (robotIds.length) {
        robotList = await this.batchFetchRobotDetail(robotIds);
      }

      const detailList = [
        ...userList.map((item) => ({
          userId: item.userId,
          avatar: item.avatar,
          name: item.realName,
          isOfficial: 0,
        })),
        ...groupList.map((item) => ({
          userId: item.groupId,
          avatar: item.iconUrl,
          name: item.name,
          isOfficial: item.isOfficial,
        })),
        ...robotList.map((item) => ({
          userId: item.code,
          avatar: item.iconUrl,
          name: item.name,
          isOfficial: 0,
        })),
      ];

      const conversationList = this.conversationList.map(
        (conv: Conversation) => {
          const detail = detailList.find(
            (user: any) => user.userId === conv.conversationId
          );
          if (detail) {
            const { avatar, name, isOfficial } = detail;
            conv.conversationName = name;
            conv.conversationAvatar = avatar;
            conv.isOfficial = isOfficial;
            // 更新本地数据
            window.$imRender.updateConversationName({
              chatID: conv.conversationId,
              conversationName: conv.conversationName,
            });
            window.$imRender.updateConversationAvatar({
              chatID: conv.conversationId,
              conversationName: conv.conversationAvatar,
            });
          }
          return conv;
        }
      );
      console.log("updateConversationAvatarAndName", conversationList);
      this.conversationList = conversationList;
      return conversationList;
    },
    // 查询会话层
    async fetchConversationList() {
      if (this.isConversationLoading) return;
      this.isConversationLoading = true;
      window.$imRender
        .getAllConversations()
        .then(async ({ data }: any) => {
          const { code, jsonParams } = data || {};
          if (code !== 0) {
            window.$log.error("查询会话层失败", data);
            return;
          }
          try {
            const list = JSON.parse(jsonParams)
              .map((conv: Conversation) => {
                conv.messageContentList = [];
                return conv;
              })
              .sort(
                (a: Conversation, b: Conversation) =>
                  (b.orderKey || 0) - (a.orderKey || 0)
              );
            this.conversationList = list;
            console.log("getAllConversations", list);
          } catch (err: any) {
            window.$log.error("fetchConversationList 解析失败", err);
          }
        })
        .then(() => {
          this.isConversationLoading = false;
        })
        .then(async () => {
          await this.updateConversationAvatarAndName(this.conversationList);
        });
    },
    // 分页查询聊天记录
    async fetchMessageList() {
      const {
        conversationId,
        conversationType,
        messageContentList = [],
      } = this.activeRecordItem;
      const param: any = {};
      if (conversationType === ConversationType.IM_CVS_TYPE_C2C) {
        param.userId = conversationId;
      } else {
        param.groupId = conversationId;
      }
      if (messageContentList.length > 0) {
        param.lastMsgSeq = messageContentList[0].seq; // 当前最老的一条消息序号
      }

      // 保证1个会话同时只存在一个分页查询请求
      if (this.messageLoading[conversationId]) {
        return [];
      }
      console.log("开始分页查询聊天记录", param);
      this.messageLoading[conversationId] = true;

      let list: any[] = [];
      try {
        const res = await window.$imRender.getHistoryMessageList(param);
        list = await this._formatMessageList(res);
      } catch (err: any) {
        window.$log.error("分页查询聊天记录出错", param, err);
        return [];
      }

      if (list.length > 0) {
        this.conversationList.forEach((item: any) => {
          if (item.conversationId === conversationId) {
            item.messageContentList = list.concat(item.messageContentList);
          }
        });
      }
      this.messageLoading[conversationId] = false;
      console.log("结束分页查询聊天记录", param, list);
      return list;
    },
    // 新增会话
    async addConversation(conversation: Conversation) {
      let conversationName = conversation.conversationName;
      let conversationAvatar = conversation.conversationAvatar;
      let isOfficial = 0;
      let messageContentList: any[] = [];
      if (conversationAvatar === "" || conversationName === "") {
        const res = await this.fetchConversationNameAndAvatar(conversation);
        conversationName = res.conversationName;
        conversationAvatar = res.conversationAvatar;
        isOfficial = res.isOfficial;
      }
      const topConv: Conversation[] = [];
      const normalConv: Conversation[] = [];
      this.conversationList.forEach((conv: Conversation) => {
        if (conv.conversationId === conversation.conversationId) {
          messageContentList = conv.messageContentList || [];
        } else if (conv.onTop) {
          topConv.push(conv);
        } else {
          normalConv.push(conv);
        }
      });

      // 新增的会话位于置顶会话之下 普通会话之上
      this.conversationList = topConv
        .concat([
          {
            ...conversation,
            conversationName,
            conversationAvatar,
            isOfficial,
            messageContentList, // 更新会话，但保留消息记录
          },
        ])
        .concat(normalConv);
      // console.log("新增会话", this.conversationList);
    },
    async updateConversation(conversation: Conversation) {
      const convList: Conversation[] = [];
      this.conversationList.forEach((item: any) => {
        if (item.conversationId === conversation.conversationId) {
          // 头像和名字如果没有 就用之前的
          const conversationName =
            conversation.conversationName || item.conversationName;
          const conversationAvatar =
            conversation.conversationAvatar || item.conversationAvatar;
          // 聊天记录保留之前的
          const messageContentList = item.messageContentList || [];
          convList.push({
            ...conversation,
            messageContentList,
            conversationName,
            conversationAvatar,
          });
        } else {
          convList.push(item);
        }
      });
      this.conversationList = convList.sort(
        (a: Conversation, b: Conversation) =>
          (b.orderKey || 0) - (a.orderKey || 0)
      );
    },
    // 新增一条接收消息
    async addReceiveMessageContent(message: Message) {
      // 单聊消息取from
      // 群聊消息取to字段
      // TODO:sdk 目前没返回event字段，这里兼容一下
      const findConvId =
        message.event === MessageEvent.M2MChat ||
        message.recvType === MessageReceiveType.Personal
          ? message.from
          : message.to;
      const msgSender = this.conversationList.find(
        (record: any) => record.conversationId === findConvId
      );

      if (!msgSender) {
        // 来新消息，消息发送者不在会话层
        // 会话层监听还没处理完，稍后再试
        setTimeout(() => this.addReceiveMessageContent(message), 1000);
        return;
      }

      const formatMessage = { ...message };
      if (!message.name || !message.avatar) {
        const { name, avatar } = await this.getNameAndAvatar(message.from);
        formatMessage.name = name;
        formatMessage.avatar = avatar;
      }

      this.conversationList.forEach((item: any) => {
        if (item.conversationId === findConvId) {
          item.messageContentList = (item.messageContentList || []).concat([
            formatMessage,
          ]);
        }
      });
    },
    // 新增一条发送消息
    async addPushMessageContent(message: Message) {
      this.conversationList.forEach(async (item: any) => {
        if (item.conversationId === message.to) {
          item.lastMsg = message;
          if (!message.name || !message.avatar) {
            const { name, avatar } = await this.getNameAndAvatar(message.from);
            message.name = name;
            message.avatar = avatar;
          }
          let isExist = false;
          const list = [];
          for (let i = 0; i < get(item, "messageContentList.length", 0); i++) {
            const msg = item.messageContentList[i];
            if (msg.mid === message.mid) {
              isExist = true;
              list.push({ ...msg, ...message });
            } else {
              list.push(msg);
            }
          }
          if (!isExist) {
            list.push(message);
          }
          item.messageContentList = list;
        }
      });
    },
    // 删除一条消息
    delMessageContent(mid: string, from?: string) {
      this.conversationList.forEach((item: any) => {
        if (item.conversationId === (from || this.activeRecordId)) {
          item.messageContentList = item.messageContentList.filter(
            (msg: any) => msg.mid !== mid
          );
        }
      });
    },
    // 点击某个会话
    handleClickConversation(conversationId: string) {
      this.activeRecordId = conversationId;
      // 查询聊天记录
      if (this.activeRecordItem.messageContentList.length === 0) {
        this.fetchMessageList();
      }
      this.conversationList.forEach((item: any) => {
        if (item.conversationId === conversationId) {
          item.numOfNotReadMsg = 0;
          item.markAsUnread = false;
          // if (item.messageContentList) {
          //   item.messageContentList.forEach((msg: any) => {
          //     msg.hasRead = 1;
          //   });
          // } else {
          //   item.messageContentList = [];
          // }
        }
      });
      // 低优先级 不阻塞会话切换
      window.requestIdleCallback(() => {
        // 设置该会话所有消息已读
        window.$imRender.updateMsgAsRead(conversationId);
      });
    },
    // 清空聊天记录
    clearMessageContent(chatId: string) {
      this.conversationList.forEach((item: any) => {
        if (item.conversationId === chatId) {
          item.messageContentList = [];
        }
      });
    },
    // 设置某条消息对端已读
    setMessageOtherSideRead(message: { to: string; mid: string }) {
      this.conversationList.forEach((item: any) => {
        if (item.conversationId === message.to) {
          item.messageContentList = item.messageContentList.map((msg: any) => {
            if (msg.mid === message.mid) {
              msg.otherSideRead = 1;
            }
            return msg;
          });
        }
      });
    },
    // 设置某条消息自己已读
    // setMessageHasRead({ mid }: any) {
    //   this.conversationList.forEach((item: any) => {
    //     item.messageContentList = (item.messageContentList || []).map(
    //       (msg: any) => {
    //         if (msg.mid === mid) {
    //           msg.hasRead = 1;
    //         }
    //         return msg;
    //       }
    //     );
    //   });
    // },
    // 设置消息发送成功或失败
    setMessageSendStatus({ conversationId, msgStatus, mid }: any) {
      this.conversationList.forEach((item: any) => {
        if (item.conversationId === conversationId) {
          item.messageContentList = (item.messageContentList || []).map(
            (msg: any) => {
              if (msg.mid === mid) {
                msg.msgStatus = msgStatus;
              }
              return msg;
            }
          );
        }
      });
    },
    // 设置某条消息已撤回
    setMessageRevoke({ mid }: any) {
      this.conversationList.forEach((item: any) => {
        item.messageContentList = (item.messageContentList || []).map(
          (msg: any) => {
            if (msg.mid === mid) {
              msg.msgStatus = MessageSendStatus.Recall;
            }
            return msg;
          }
        );
      });
    },
    async _formatMessageList(res: any) {
      const { code, jsonParams } = res.data;
      if (code !== 0) {
        return [];
      }
      try {
        const list = (JSON.parse(jsonParams) || []).sort(
          (a: any, b: any) => (a.seq || 0) - (b.seq || 0)
        );
        for (let i = 0; i < list.length; i++) {
          if (!list[i].name || !list[i].avatar) {
            const { name, avatar } = await this.getNameAndAvatar(list[i].from);
            list[i].name = name;
            list[i].avatar = avatar;
          }
        }
        return list;
      } catch (err: any) {
        window.$log.error("_formatMessageList", err);
      }
      return [];
    },

    setAudioAndVideoCallRequestMessageContent(
      msg: null | VideoCallRequestMessageContent
    ) {
      this.audioAndVideoCallRequestMessageContent = msg;
    },
    setIsAudioAndVideoCallRequestVisible(visible: boolean) {
      this.isAudioAndVideoCallRequestVisible = visible;
    },
    setAudioAndVideoCallDialogVisible(visible: boolean) {
      this.isAudioAndVideoCallDialogVisible = visible;
    },
    setIsAudioAndVideoCallSmallDialogVisible(visible: boolean) {
      this.isAudioAndVideoCallSmallDialogVisible = visible;
    },
    clearAudioAndVideoCallRequestTimer() {
      if (this.audioAndVideoCallRequestTimer) {
        clearTimeout(this.audioAndVideoCallRequestTimer);
      }
    },
    setAudioAndVideoCallStartTime(date: Date) {
      this.audioAndVideoCallStartTime = date;
    },
    answerCall() {
      const { userId } = useUserStore();
      const receiver =
        this.audioAndVideoCallRequestMessageContent?.replyId === userId
          ? get(this, "audioAndVideoCallRequestMessageContent.inviteeIds[0]")
          : get(this, "audioAndVideoCallRequestMessageContent.replyId");
      const customContent = {
        type: VideoCallResult.ACCEPT,
      };
      window.$imRender
        .sendCustomMessage({
          content: {
            text: JSON.stringify(customContent),
            isNotice: true,
          },
          receiver,
          isGroup: null,
        })
        .then(({ data }: any) => {
          if (data.code === 0) {
            this.setAudioAndVideoCallDialogVisible(true);
            this.setAudioAndVideoCallStartTime(new Date()); // 记录音视频开始时间
          }
        });
      this.setIsAudioAndVideoCallRequestVisible(false);
    },
    refuseCall() {
      const { userId } = useUserStore();
      const receiver =
        this.audioAndVideoCallRequestMessageContent?.replyId === userId
          ? get(this, "audioAndVideoCallRequestMessageContent.inviteeIds[0]")
          : get(this, "audioAndVideoCallRequestMessageContent.replyId");
      const customContent = {
        type: VideoCallResult.REJECT,
        rejectId: userId,
      };
      window.$imRender.sendCustomMessage({
        content: {
          text: JSON.stringify(customContent),
          isNotice: true,
        },
        receiver,
        isGroup: null,
        callback: () => {},
      });
      this.setIsAudioAndVideoCallRequestVisible(false);
    },
  },
});
