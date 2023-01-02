<template>
  <div class="h-full flex">
    <MessageRecord />
    <MessageDetail />
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { useRoute } from "vue-router";
import { useMessageStore } from "@/store/modules/message";
import MessageRecord from "@/components/MessageRecord/index.vue";
import MessageDetail from "@/components/MessageDetail/index.vue";
import { Conversation, ConversationType } from "@/types/message";

const route = useRoute();
const messageStore = useMessageStore();

const startChat = () => {
  const { userId, realName, iconUrl, isGroup } = route.query;
  if (userId) {
    // 主动发起会话
    const isExist = messageStore.conversationList.some(
      ({ conversationId }) => conversationId === userId
    );
    if (!isExist) {
      messageStore.addConversation({
        conversationAvatar: iconUrl as string,
        conversationName: realName as string,
        conversationId: userId as string,
        conversationType: isGroup
          ? ConversationType.IM_CVS_TYPE_GROUP
          : ConversationType.IM_CVS_TYPE_C2C,
        messageContentList: [],
      } as unknown as Conversation);
    }
    messageStore.setActiveRecordId(userId as string);

    // TODO:这里不能用nextTick
    setTimeout(() => {
      const conversationEle = document.querySelector(`#${userId}`);
      if (conversationEle) {
        conversationEle.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 0);
  }
};
startChat();

watch(
  () => route.query,
  () => {
    startChat();
  }
);
</script>

<style lang="less" scoped></style>
