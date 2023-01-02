<template>
  <div
    :id="props.conversation.conversationId"
    class="message-item h-[64px] bg-white flex items-center p-2 cursor-pointer rounded-md select-none"
    :class="{
      active: props.conversation.conversationId === messageStore.activeRecordId,
      top: !!props.conversation.onTop,
    }"
  >
    <div class="pointer-events-none">
      <el-badge
        :value="notReadMsgCount"
        :hidden="notReadMsgCount === 0"
        :is-dot="props.conversation.noInform"
        class="badge"
      >
        <UserAvatar
          :src="avatar"
          :name="props.conversation.conversationName"
          :id="props.conversation.conversationId"
        />
      </el-badge>
    </div>
    <div class="middle-text flex flex-col">
      <div class="flex justify-between items-center">
        <div class="title truncate">
          <span class="font-normal text-black">{{
            props.conversation.conversationName ||
            props.conversation.conversationId
          }}</span>
          <span
            class="inline-block ml-1 py-[1px] px-[4px] bg-gray-100 text-xs text-[#00b0bb] font-medium"
            v-if="
              ['ROBOT_AGENDA', 'ROBOT_TASK', 'ROBOT_PIN'].includes(
                props.conversation.conversationId
              )
            "
            >系统</span
          >
          <span
            class="inline-block ml-1 py-[1px] px-[4px] bg-gray-100 text-xs text-[#00b0bb] font-medium"
            v-else-if="props.conversation.isOfficial"
            >部门</span
          >
        </div>
        <div class="time w-16 text-gray">
          {{ lastMsgSendTime }}
        </div>
      </div>
      <div class="flex justify-between items-center">
        <div v-if="hasAnyoneAtMe" class="one-line">
          <span
            v-if="
              props.conversation.hasAnyoneCare === HasAnyoneCare.Me_And_All ||
              props.conversation.hasAnyoneCare === HasAnyoneCare.All
            "
            class="text-red-500"
            >[@所有人]</span
          >
          <span
            v-if="
              props.conversation.hasAnyoneCare === HasAnyoneCare.Me_And_All ||
              props.conversation.hasAnyoneCare === HasAnyoneCare.Me
            "
            class="text-red-500"
            >[有人@我]</span
          >
          {{ lastMsgContent }}
        </div>
        <div v-else-if="props.conversation.draftText" class="one-line">
          <span class="text-red-500">[草稿]</span>
          <span class="text-gray-400">{{ props.conversation.draftText }}</span>
        </div>
        <div v-else class="text-gray-400 one-line">
          {{ lastMsgContent }}
        </div>
        <img
          v-if="!!props.conversation.noInform"
          src="@/assets/disturb-icon.png"
          class="h-[18px]"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageItem",
});
</script>

<script lang="ts" setup>
import { ref, computed, watchEffect } from "vue";
import { format, differenceInDays, differenceInYears } from "date-fns";
import { get } from "lodash-es";
import { useMessageStore } from "@/store/modules/message";
import { useUserStore } from "@/store/modules/user";
import {
  Conversation,
  HasAnyoneCare,
  ConversationType,
  MessageSendStatus,
} from "@/types/message";
import { getMessagePreview } from "@/utils/message";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { Default_Group_Avatar } from "@/constant/base64";

interface Props {
  conversation: Conversation;
}

const messageStore = useMessageStore();
const userStore = useUserStore();

const props = defineProps<Props>();
const avatar = computed(() => {
  let avatar = props.conversation.conversationAvatar;
  if (
    !avatar &&
    props.conversation.conversationType === ConversationType.IM_CVS_TYPE_GROUP
  ) {
    // 群聊默认头像
    avatar = Default_Group_Avatar;
    return avatar;
  }

  return get(window.__GLOBAL_AVATAR_CACHE__, avatar, avatar);
});
const notReadMsgCount = computed(() => {
  const count = props.conversation.numOfNotReadMsg;
  return count || (props.conversation.markAsUnread ? 1 : 0);
});
const lastMsgSendTime = computed(() => {
  // 优先展示草稿发送时间
  const sendTime =
    (props.conversation.draftTimestamp ||
      get(props.conversation, "lastMsg.sendTime", 0)) * 1000;
  if (sendTime === 0) return "";
  const now = Date.now();
  if (differenceInYears(now, sendTime) >= 1) {
    return format(sendTime, "yyyy/MM/dd");
  }
  if (differenceInDays(now, sendTime) > 1) {
    return format(sendTime, "MM/dd");
  }
  if (differenceInDays(now, sendTime) === 1) {
    return "昨天";
  }
  return format(sendTime, "HH:mm");
});
const hasAnyoneAtMe = computed(() => {
  return [
    HasAnyoneCare.Me,
    HasAnyoneCare.All,
    HasAnyoneCare.Me_And_All,
  ].includes(props.conversation.hasAnyoneCare);
});
const lastMsgContent = ref("");
watchEffect(async () => {
  const lastMsg = props.conversation.lastMsg;
  if (!lastMsg) {
    lastMsgContent.value = "";
    return;
  }
  if (lastMsg.msgStatus === MessageSendStatus.Recall) {
    const { name } = await messageStore.getNameAndAvatar(lastMsg.from);
    const who = lastMsg.from === userStore.userId ? "你" : name;
    lastMsgContent.value = `${who}撤回了一条消息`;
    return;
  }
  // console.log("会话层最后一条消息", lastMsg);
  lastMsgContent.value = getMessagePreview(lastMsg);
});
</script>

<style lang="less" scoped>
.badge {
  :deep(.el-badge__content.is-fixed) {
    top: 5px;
    right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
  :deep(.el-badge__content.is-fixed.is-dot) {
    width: 12px;
    height: 12px;
    top: 6px;
    right: 12px;
  }
}

.message-item {
  &.active {
    background: rgba(0, 176, 187, 0.1) !important;
  }
  &.top {
    background: #f5f5f5;
  }
  &:hover {
    background: #f5f5f5;
  }
  .middle-text {
    margin-left: 14px;
    flex: 1;
    .title {
      max-width: 180px;
      color: #000;
      font-size: 14px;
      font-weight: 400;
      line-height: 18px;
      margin-bottom: 4px;
    }
    .time {
      font-size: 10px;
      text-align: right;
    }
  }
}

.one-line {
  font-size: 12px;
  width: 200px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
