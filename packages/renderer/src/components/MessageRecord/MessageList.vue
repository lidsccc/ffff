<template>
  <div
    v-loading="messageStore.isConversationLoading"
    class="message-list flex-1 px-1 overflow-y-auto"
  >
    <div
      v-if="
        !messageStore.isConversationLoading && conversationList.length === 0
      "
      class="flex items-center justify-center"
    >
      <el-empty description="暂无数据" />
    </div>
    <div v-else>
      <MessageItem
        v-for="item in conversationList"
        :key="item.conversationId"
        :conversation="item"
        v-contextmenu:messageItemRef
        @contextmenu.prevent="handleContextMenuShow(item)"
        @click="handleMessageItemClick(item)"
      />
    </div>
    <v-contextmenu ref="messageItemRef">
      <v-contextmenu-item
        v-if="!currentContextMenuItem.onTop"
        @click="() => handleTop(true)"
        >消息置顶</v-contextmenu-item
      >
      <v-contextmenu-item v-else @click="() => handleTop(false)"
        >取消置顶</v-contextmenu-item
      >
      <v-contextmenu-item
        v-if="
          !currentContextMenuItem.markAsUnread &&
          currentContextMenuItem.numOfNotReadMsg === 0
        "
        @click="handleMarkUnread(true)"
        >标为未读</v-contextmenu-item
      >
      <v-contextmenu-item v-else @click="handleMarkUnread(false)"
        >标为已读</v-contextmenu-item
      >
      <v-contextmenu-item
        v-if="!currentContextMenuItem.noInform"
        @click="() => handleDisturb(true)"
        >消息免打扰</v-contextmenu-item
      >
      <v-contextmenu-item v-else @click="() => handleDisturb(false)"
        >取消免打扰</v-contextmenu-item
      >
      <v-contextmenu-item @click="handleDelete">删除聊天</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageList",
});
</script>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import MessageItem from "./MessageItem.vue";
import { useMessageStore } from "@/store/modules/message";
import { ElMessage } from "element-plus";
import type { Conversation } from "@/types/message";

const messageStore = useMessageStore();

const conversationList = computed(() => {
  // 过滤Pin会话，Pin消息在Pin模块展示
  return messageStore.conversationList.filter(
    (conv: any) => conv.conversationId !== "ROBOT_PIN"
  );
});

onMounted(() => {
  // TODO:mac环境待机后会出现会话层为空的问题 暂没找到原因 重新拉取一遍会话层
  if (messageStore.conversationList.length === 0) {
    console.log("重新拉取会话层");
    messageStore.fetchConversationList();
  }
});

// 消息已读
const handleMessageItemClick = ({ conversationId }: Conversation) => {
  messageStore.handleClickConversation(conversationId);
};

const messageItemRef = ref();
const currentContextMenuItem = ref<any>({});
const handleContextMenuShow = (item: any) => {
  currentContextMenuItem.value = item;
};
// 置顶
const handleTop = (isPinned: boolean) => {
  const {
    conversationId,
    conversationType,
    conversationName,
    conversationAvatar,
  } = currentContextMenuItem.value;
  const conv = {
    conversationId,
    conversationName,
    conversationAvatar,
    conversationType,
  };
  window.$imRender.setConversationOnTop({
    convStr: JSON.stringify(conv),
    isPinned,
  });
};
// 免打扰
const handleDisturb = (noInform: boolean) => {
  const {
    conversationId,
    conversationType,
    conversationName,
    conversationAvatar,
  } = currentContextMenuItem.value;
  const conv = {
    conversationId,
    conversationName,
    conversationAvatar,
    conversationType,
  };
  window.$imRender.setConversationNoInform({
    convStr: JSON.stringify(conv),
    noInform,
  });
};
// 删除会话
const handleDelete = () => {
  const chatId = currentContextMenuItem.value.conversationId;
  window.$imRender
    .deleteConversationByChatId(chatId)
    .then(({ data }: any) => {
      if (data === 1) {
        // 设置成功更新会话层
        messageStore.deleteConversation(chatId);
      } else {
        window.$log.error("删除聊天失败: ", data);
        ElMessage.error({ message: "删除聊天失败" });
      }
    })
    .catch((err: any) => {
      window.$log.error("删除会话层异常： ", err);
    });
};
// 标记会话层为未读/已读
const handleMarkUnread = (markAsUnread: boolean) => {
  window.$imRender.changeConversationReadStatus({
    chatId: currentContextMenuItem.value.conversationId,
    markAsUnread,
  });
};
</script>

<style lang="less" scoped>
.message-list::-webkit-scrollbar {
  display: none;
}
</style>
