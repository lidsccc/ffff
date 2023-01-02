<template>
  <div
    v-if="!messageStore.activeRecordId"
    class="h-full flex justify-center items-center"
  >
    <img src="@/assets/login-bg.png" class="w-1/2" />
  </div>
  <div v-else class="flex-1 min-w-[600px] h-full flex flex-col bg-[#f1f2f3]">
    <div class="flex-auto overflow-hidden">
      <MessageDisplay
        :list="messageList"
        :status="status"
        @on-send-message="sendMessage"
        @on-change-status="changeStatus"
        @on-recall-message="recallMessage"
        @on-forward-message="forwardMessage"
      />
    </div>
    <div class="h-40">
      <MessageInput
        v-if="showMessageInput"
        :status="status"
        @on-change-status="changeStatus"
        @on-send-message="sendMessage"
        @on-forward-message="forwardMessage"
      />
    </div>
  </div>
  <ContactSelect
    :visible="contactSelectVisible"
    :showGroup="true"
    @on-visible-change="handleVisibleChange"
    @on-confirm="onConfirm"
    @on-cancel="onCancel"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageDetail",
});
</script>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from "vue";
import { cloneDeep } from "lodash-es";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { useGlobalStore } from "@/store/modules/global";
import MessageDisplay from "./MessageDisplay.vue";
// import MessageInput from "./MessageInput.vue";
import MessageInput from "@/components/MessageInputNew/index.vue";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { MessageOperationStatus, MessageBubbleType } from "./type.d.ts";
import {
  MessageContentType,
  CustomMessageType,
  ForwardType,
  ConversationType,
  // MessageEvent,
} from "@/types/message";
import { getMessagePreview } from "@/utils/message";

const userStore = useUserStore();
const messageStore = useMessageStore();

const messageList = computed(() => {
  return messageStore.activeRecordItem.messageContentList || [];
});

const list = ref<MessageBubbleType[]>([]);

const status = ref<MessageOperationStatus>(MessageOperationStatus.Input);
const changeStatus = (val: MessageOperationStatus) => {
  if (val === MessageOperationStatus.Input) {
    list.value = list.value.map((item) => {
      item.checked = false;
      return item;
    });
  }
  status.value = val;
};

const showMessageInput = ref(true);
watch(
  () => messageStore.activeRecordId,
  () => {
    // 切换会话层
    showMessageInput.value = false;
    status.value = MessageOperationStatus.Input;
    messageStore.referenceMessage = null;
    // 重新渲染输入框
    nextTick(() => {
      showMessageInput.value = true;
    });
  }
);

const recallMessage = (message: any) => {
  console.log("撤回消息", message);
  if (!message.mid) {
    return;
  }
  window.$imRender.revokeMessage({
    msgID: message.mid,
    chatID: messageStore.activeRecordId,
    isGroup:
      messageStore.activeRecordItem.conversationType ===
      ConversationType.IM_CVS_TYPE_GROUP,
    callback: ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        messageStore.setMessageRevoke({
          mid: message.mid,
        });
      } else {
        window.$log.error("撤回失败", [code, desc, jsonParams]);
      }
    },
  });
};

const contactSelectVisible = ref(false);
const handleVisibleChange = (visible: boolean) => {
  contactSelectVisible.value = visible;
};
const globalStore = useGlobalStore();
const onConfirm = async () => {
  // 最多支持转发9人
  if (globalStore.selectedUserList.length > 9) {
    ElMessage.warning({ message: "最多只能选择9个" });
    return;
  }

  const selectedMessageList = (
    messageStore.activeRecordItem.messageContentList || []
  ).filter((item: any) => item.checked && item.mid);
  switch (forwardType.value) {
    case ForwardType.Single:
      if (selectedMessage.value) {
        globalStore.selectedUserList.map((user: any) => {
          window.$imRender.sendMessage({
            msgJsonStr: JSON.stringify(selectedMessage.value),
            receiver: user.isGroup ? null : user.id,
            groupID: user.isGroup ? user.id : null,
            callback: ([code, desc, jsonParams]: any) => {
              console.log("转发消息成功", [code, desc, jsonParams]);
              if (code !== 0 || !jsonParams) {
                return;
              }
              try {
                const message = JSON.parse(jsonParams);
                if (user.id !== userStore.userId) {
                  messageStore.addPushMessageContent(message);
                }
              } catch (err) {
                window.$log.error("添加转发消息失败:", [
                  code,
                  desc,
                  jsonParams,
                ]);
              }
            },
          });
        });
      }
      break;
    case ForwardType.OneByOne:
      selectedMessageList.forEach((message: any) => {
        globalStore.selectedUserList.map((user: any) => {
          window.$imRender.sendMessage({
            msgJsonStr: JSON.stringify(message),
            receiver: user.isGroup ? null : user.id,
            groupID: user.isGroup ? user.id : null,
            callback: ([code, desc, jsonParams]: any) => {
              console.log("转发消息成功", [code, desc, jsonParams]);
              if (code !== 0 || !jsonParams) {
                return;
              }
              try {
                const message = JSON.parse(jsonParams);
                if (user.id !== userStore.userId) {
                  messageStore.addPushMessageContent(message);
                }
              } catch (err) {
                window.$log.error("添加转发消息失败:", [
                  code,
                  desc,
                  jsonParams,
                ]);
              }
            },
          });
        });
      });
      (messageStore.activeRecordItem.messageContentList || []).forEach(
        (item: any) => {
          if (item.checked) {
            item.checked = false;
          }
        }
      );
      break;
    case ForwardType.Together:
      const userList = [
        ...new Set(selectedMessageList.map((item: any) => item.name)),
      ];
      let title = "";
      if (
        messageStore.activeRecordItem.conversationType ===
        ConversationType.IM_CVS_TYPE_C2C
      ) {
        title =
          userList.length === 1
            ? `${userList[0]}的聊天记录`
            : `${userList.join("和")}的聊天记录`;
      } else {
        title = "群聊的聊天记录";
      }
      const jsonObj = {
        title,
        abstractList: selectedMessageList
          .slice(0, 5)
          .map((item: any) => `${item.name}：${getMessagePreview(item)}`), // 最多展示5条合并消息的预览
        mergerMessageList: cloneDeep(selectedMessageList).map((item: any) => {
          delete item.checked;
          return item;
        }),
      };
      const jsonStr = JSON.stringify(jsonObj);
      const { data } = await window.$imRender.buildMergerMsg({ jsonStr });
      globalStore.selectedUserList.map((user: any) => {
        window.$imRender.sendMessage({
          msgJsonStr: data,
          receiver: user.isGroup ? null : user.id,
          groupID: user.isGroup ? user.id : null,
          callback: ([code, desc, jsonParams]: any) => {
            console.log("合并转发消息成功", [code, desc, jsonParams]);
            if (code !== 0 || !jsonParams) {
              return;
            }
            try {
              const message = JSON.parse(jsonParams);
              if (user.id !== userStore.userId) {
                messageStore.addPushMessageContent(message);
              }
            } catch (err) {
              window.$log.error("添加转发消息失败:", [code, desc, jsonParams]);
            }
          },
        });
      });
      (messageStore.activeRecordItem.messageContentList || []).forEach(
        (item: any) => {
          if (item.checked) {
            item.checked = false;
          }
        }
      );
      break;
  }

  contactSelectVisible.value = false;
};
const onCancel = () => {
  contactSelectVisible.value = false;
};
// 转发消息
const forwardType = ref(ForwardType.Single);
const selectedMessage = ref(null); // 转发单条消息
const forwardMessage = ({ type, value }: any) => {
  forwardType.value = type;
  selectedMessage.value = value;
  contactSelectVisible.value = true;
};
// 发消息出去
const sendMessage = async ({ type, params, receiver, groupID }: any) => {
  const isGroup =
    messageStore.activeRecordItem.conversationType ===
    ConversationType.IM_CVS_TYPE_GROUP;
  if (groupID === undefined && isGroup) {
    // 群聊
    groupID = messageStore.activeRecordId;
    receiver = null;
  } else if (!receiver) {
    receiver = messageStore.activeRecordId;
  }

  const handleSendMsgResponse = (
    [code, desc, jsonParams]: any,
    message?: any
  ) => {
    if (code !== 0 && code !== 3) {
      window.$log.error("消息发送失败", [code, desc, jsonParams]);
    }
    if (
      message &&
      [
        MessageContentType.File,
        MessageContentType.Video,
        MessageContentType.Image,
      ].includes(message.msgType) &&
      code === 3
    ) {
      // 更新发送进度
      const percent = Math.floor(desc * 100);
      messageStore.updateMessageTransmissionPercentage(message.mid, percent);
    }
    if (!jsonParams) {
      return;
    }
    try {
      const message = JSON.parse(jsonParams);
      if (receiver !== userStore.userId) {
        console.log("新增发送消息", message);
        messageStore.addPushMessageContent(message);
      }
    } catch (err) {
      window.$log.error("sendMessage parse error:", [code, desc, jsonParams]);
    }
  };
  let message: any;
  let messageContent = params;
  switch (type) {
    case MessageContentType.Text:
      const apiName =
        messageStore.activeRecordItem.conversationType ===
          ConversationType.IM_CVS_TYPE_GROUP &&
        (params.userList || []).length > 0
          ? "sendAtMessage"
          : "sendTextMessage";
      window.$imRender[apiName]({
        content: {
          ...params,
          userList: JSON.stringify(params.userList),
        },
        receiver,
        groupID,
        callback: handleSendMsgResponse,
      });
      break;
    case MessageContentType.Image:
      const { data: jsonParams } = await window.$imRender.buildImgMsg({
        imagePath: params.imagePath,
      });
      try {
        message = JSON.parse(jsonParams);
        message.to = isGroup ? groupID : receiver;
        if (receiver !== userStore.userId) {
          console.log("新增构建消息", message);
          messageStore.addPushMessageContent(message);
        }
      } catch (err) {
        window.$log.error("buildMessage parse error:", jsonParams);
      }
      window.$imRender.sendMessage({
        msgJsonStr: jsonParams,
        receiver,
        groupID,
        callback: (data: any) => handleSendMsgResponse(data, message),
      });
      break;
    case MessageContentType.Audio:
      window.$imRender.sendAudioMessage({
        content: params,
        receiver,
        groupID,
        callback: handleSendMsgResponse,
      });
      break;
    case MessageContentType.Video:
      const { data: jsonParamsVideo } = await window.$imRender.buildVideoMsg(
        params
      );
      try {
        message = JSON.parse(jsonParamsVideo);
        message.to = isGroup ? groupID : receiver;
        if (receiver !== userStore.userId) {
          console.log("新增构建消息", message);
          messageStore.addPushMessageContent(message);
        }
      } catch (err) {
        window.$log.error("buildMessage parse error:", jsonParamsVideo);
      }
      window.$imRender.sendMessage({
        msgJsonStr: jsonParamsVideo,
        receiver,
        groupID,
        callback: (data: any) => handleSendMsgResponse(data, message),
      });
      break;
    case MessageContentType.File:
      const { data: jsonParamsFile } = await window.$imRender.buildFileMsg(
        params
      );
      try {
        message = JSON.parse(jsonParamsFile);
        message.to = isGroup ? groupID : receiver;
        if (receiver !== userStore.userId) {
          console.log("新增构建消息", message);
          messageStore.addPushMessageContent(message);
        }
      } catch (err) {
        window.$log.error("buildMessage parse error:", jsonParamsFile);
      }
      window.$imRender.sendMessage({
        msgJsonStr: jsonParamsFile,
        receiver,
        groupID,
        callback: (data: any) => handleSendMsgResponse(data, message),
      });
      break;
    case MessageContentType.Merger:
      messageContent = JSON.parse(params.jsonStr);
      window.$imRender.sendMergerMessage({
        content: params,
        receiver,
        groupID,
        callback: (data: any) => handleSendMsgResponse(data, messageContent),
      });
      break;
    case MessageContentType.Custom:
      const customContent = {
        type: CustomMessageType.MSG_WITH_QUOTED_MSG,
        text: params.text,
        quotedMsg: JSON.stringify(messageStore.referenceMessage),
      };
      messageContent = { data: JSON.stringify(customContent) };
      window.$imRender.sendCustomMessage({
        content: { text: JSON.stringify(customContent) },
        receiver,
        groupID,
        callback: (data: any) => handleSendMsgResponse(data, messageContent),
      });
      break;
    default:
  }

  // messageStore.addPushMessageContent({
  //   content: JSON.stringify(messageContent),
  //   from: userStore.userId,
  //   msgType: type,
  //   event: groupID ? MessageEvent.GroupChat : MessageEvent.M2MChat,
  //   to: groupID || receiver,
  //   sendTime: Math.floor(Date.now() / 1000),
  // });
};
</script>

<style lang="less" scoped></style>
