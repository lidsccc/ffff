<template>
  <div :class="props.select ? 'select-none pointer-events-none' : ''">
    <div
      v-if="props.detail.msgStatus === MessageSendStatus.Recall"
      class="flex justify-center place-items-center text-xs text-gray-400 py-[16px]"
    >
      <div>
        {{
          fromOther ? (isGroupMessage ? props.detail.name : "对方") : "你"
        }}撤回了一条消息
      </div>
    </div>
    <GroupNotifyMessage
      v-else-if="props.detail.msgType === MessageContentType.GROUP_NOTICE"
      :detail="props.detail"
    />
    <div v-else>
      <div v-if="showTime" class="flex justify-center py-2">
        <span class="text-xs text-gray-400">{{ messageSendTime }}</span>
      </div>
      <div
        class="flex p-3"
        :class="{
          'flex-row-reverse': !fromOther,
          // 'bg-gray-200': props.detail.checked,
        }"
      >
        <div
          class="h-11 flex items-center select-none cursor-pointer"
          @click="handleUserDetailShow"
        >
          <UserAvatar
            :key="props.detail.from"
            :size="36"
            :src="avatar"
            :name="firstName"
            :id="props.detail.from"
            :class="fromOther ? 'mr-2' : 'ml-2'"
          />
          <!-- <el-avatar
            :key="props.detail.from"
            :size="36"
            :src="avatar"
            :class="fromOther ? 'mr-2' : 'ml-2'"
            ><span v-if="firstName">{{ firstName }}</span
            ><el-icon v-else><User /></el-icon
          ></el-avatar> -->
        </div>
        <div class="max-w-[60%]">
          <div class="mb-1 text-gray-400" v-if="isGroupMessage && fromOther">
            {{ props.detail.name || "" }}
          </div>
          <TextMessage
            v-if="
              props.detail.msgType === MessageContentType.Text ||
              isQuotedMessage(props.detail)
            "
            :detail="props.detail"
          />
          <ImageMessage
            v-else-if="props.detail.msgType === MessageContentType.Image"
            :detail="props.detail"
          />
          <MergerMessage
            v-else-if="props.detail.msgType === MessageContentType.Merger"
            :detail="props.detail"
          />
          <AudioMessage
            v-else-if="props.detail.msgType === MessageContentType.Audio"
            :detail="props.detail"
          />
          <VideoMessage
            v-else-if="props.detail.msgType === MessageContentType.Video"
            :detail="props.detail"
          />
          <LocationMessage
            v-else-if="props.detail.msgType === MessageContentType.Location"
            :detail="props.detail"
          />
          <BusinessCardMessage
            v-else-if="isBusinessCardMessage(props.detail)"
            :detail="props.detail"
          />
          <FileMessage
            v-else-if="props.detail.msgType === MessageContentType.File"
            :detail="props.detail"
          />
          <ArticleMessage
            v-else-if="props.detail.msgType === MessageContentType.Article"
            :detail="props.detail"
          />
          <TaskMessage
            v-else-if="isTaskMessage(props.detail)"
            :detail="props.detail"
          />
          <AgendaMessage
            v-else-if="isAgendaMessage(props.detail)"
            :detail="props.detail"
          />
          <UnknowMessage v-else :detail="props.detail" />
        </div>
        <!--已读/未读/发送失败状态-->
        <div
          class="flex flex-col flex-col-reverse mr-2"
          v-if="!fromOther && !isGroupMessage"
        >
          <div
            v-if="props.detail.msgStatus === MessageSendStatus.Failed"
            class="w-4 h-4 border-2 rounded-3xl border-red-600 cursor-pointer"
            @click="retrySendMessage"
          ></div>
          <div
            v-else
            class="w-4 h-4 border-2 rounded-3xl"
            :class="sendStatusClass"
          ></div>
        </div>
      </div>
      <QuotedMessage
        v-if="isQuotedMessage(props.detail)"
        :detail="props.detail"
      />
    </div>
  </div>
  <el-dialog v-model="userDetailVisible" width="400px" destroy-on-close>
    <UserDetail
      :id="props.detail.from"
      :hideCreateChatBtn="hideCreateChatBtn"
    />
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageBubble",
});
</script>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { get } from "lodash-es";
import { format, differenceInDays, differenceInYears } from "date-fns";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import {
  MessageSendStatus,
  MessageContentType,
  Message,
  MessageEvent,
} from "@/types/message";
import {
  isQuotedMessage,
  isBusinessCardMessage,
  isTaskMessage,
  isAgendaMessage,
} from "@/utils/message";
import TextMessage from "@/components/MessageType/TextMessage.vue";
import ImageMessage from "@/components/MessageType/ImageMessage.vue";
import MergerMessage from "@/components/MessageType/MergerMessage.vue";
import QuotedMessage from "@/components/MessageType/QuotedMessage.vue";
import AudioMessage from "@/components/MessageType/AudioMessage.vue";
import VideoMessage from "@/components/MessageType/VideoMessage.vue";
import LocationMessage from "@/components/MessageType/LocationMessage.vue";
import BusinessCardMessage from "@/components/MessageType/BusinessCardMessage.vue";
import FileMessage from "@/components/MessageType/FileMessage.vue";
import GroupNotifyMessage from "@/components/MessageType/GroupNotifyMessage.vue";
import ArticleMessage from "@/components/MessageType/ArticleMessage.vue";
import TaskMessage from "@/components/MessageType/TaskMessage.vue";
import AgendaMessage from "@/components/MessageType/AgendaMessage.vue";
import UnknowMessage from "@/components/MessageType/UnknowMessage.vue";
import UserDetail from "@/components/UserDetail/index.vue";
import UserAvatar from "@/components/UserAvatar/index.vue";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  detail: Message;
  select?: boolean;
  showTime?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  select: false,
  showTime: false,
});
const userDetailVisible = ref(false);
const handleUserDetailShow = () => {
  userDetailVisible.value = true;
};

const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});
const isGroupMessage = computed(() => {
  return props.detail.event === MessageEvent.GroupChat;
});
const hideCreateChatBtn = computed(() => {
  return !isGroupMessage.value || (isGroupMessage.value && !fromOther.value);
});
const firstName = computed(() => {
  if (fromOther.value) {
    return isGroupMessage.value
      ? get(props.detail, "name[0]", "")
      : get(messageStore, "activeRecordItem.conversationName[0]");
  }
  return userStore.firstName;
});
const avatar = computed(() => {
  let avatar;
  if (fromOther.value) {
    avatar = isGroupMessage.value
      ? props.detail.avatar
      : messageStore.activeRecordItem.conversationAvatar;
  } else {
    avatar = userStore.avatar;
  }

  avatar = get(window.__GLOBAL_AVATAR_CACHE__, avatar, avatar);
  return avatar;
});
const messageSendTime = computed(() => {
  const sendTime = get(props.detail, "sendTime", 0) * 1000;
  if (sendTime === 0) return "";
  const now = Date.now();
  if (differenceInYears(now, sendTime) >= 1) {
    return format(sendTime, "yyyy年M月d日 HH:mm");
  }
  if (differenceInDays(now, sendTime) > 1) {
    return format(sendTime, "M月d日 HH:mm");
  }
  if (differenceInDays(now, sendTime) === 1) {
    return format(sendTime, "昨天 HH:mm");
  }
  return format(sendTime, "HH:mm");
});

const sendStatusClass = computed(() => {
  // 发送中
  if (
    props.detail.msgStatus === undefined ||
    props.detail.msgStatus === MessageSendStatus.ToSend ||
    props.detail.msgStatus === MessageSendStatus.Sending
  ) {
    return "border-blue-300";
  }

  // 对方是否已读
  return props.detail.otherSideRead ? "border-primary" : "border-gray-400";
});

const retrySendMessage = () => {
  console.log("消息重发", props.detail);
  const { event, to } = props.detail;
  const msgJsonStr = JSON.stringify(props.detail);
  const receiver = event === MessageEvent.GroupChat ? null : to;
  const groupID = event === MessageEvent.GroupChat ? to : null;
  window.$imRender.sendMessage({
    msgJsonStr,
    receiver,
    groupID,
    callback: ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        console.log("消息重发成功", [code, desc, jsonParams]);
        // 重发成功
        messageStore.setMessageSendStatus({
          conversationId: props.detail.to,
          mid: props.detail.mid,
          msgStatus: MessageSendStatus.Sended,
        });
      }
    },
  });
};
</script>

<style lang="less" scoped></style>
