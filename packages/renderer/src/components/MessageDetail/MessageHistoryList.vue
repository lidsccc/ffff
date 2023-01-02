<template>
  <div v-infinite-scroll="loadMore" class="h-[400px] overflow-y-auto">
    <MessageList :list="historyMessageList" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageHistoryList",
});
</script>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { MessageContentType } from "@/types/message";
import { debounce } from "lodash-es";
import { useMessageStore } from "@/store/modules/message";
import MessageList from "@/components/MessageList/index.vue";

const messageStore = useMessageStore();

interface Props {
  searchValue?: string;
  msgType?: MessageContentType[];
}

const props = withDefaults(defineProps<Props>(), {
  searchValue: "",
  msgType: () => [],
});

const historyMessageList = ref([]);

const filterHistoryMessageList = () => {
  const list = messageStore.activeRecordItem.messageContentList.filter(
    (item: any) => {
      if (item.msgType === MessageContentType.GROUP_NOTICE) {
        return false;
      }
      if (props.msgType.length === 0) {
        return true;
      }
      return props.msgType?.includes(item.msgType);
    }
  );
  historyMessageList.value = list.sort((a: any, b: any) => b.seq - a.seq);
};
const searchHistory = debounce(() => {
  // 搜索聊天记录
  const searchParam = {
    chatId: messageStore.activeRecordId, // 会话层ID，不传就是全局搜索
    keywordList: [props.searchValue], // 关键字列表，最多传5个
    keywordListMatchType: 1, // 0: 包含任意一个关键字的结果；1：包含全部关键字的结果
    // senderUserIdList: [], // 发送人ID列表
    messageTypeList: props.msgType, // 消息类型，不指定就搜索全部消息类型
  };
  window.$imRender.searchLocalMessages({
    searchParam,
    callback: ([code, desc, jsonParams]: any) => {
      console.log("搜索历史记录", [code, desc, jsonParams]);
      if (code === 0) {
        try {
          const { conversationHistoryList = [] } = JSON.parse(jsonParams);
          const { messageList = [] } =
            conversationHistoryList.find(
              (item: any) => item.conversationId === messageStore.activeRecordId
            ) || {};
          historyMessageList.value = messageList;
        } catch (err: any) {
          window.$log.error("解析消息历史记录搜索结果异常", err);
        }
      }
    },
  });
}, 500);
filterHistoryMessageList();

watch([() => props.searchValue, () => props.msgType], () => {
  if (props.searchValue) {
    searchHistory();
  } else {
    filterHistoryMessageList();
  }
});

const loadMore = () => {
  // 滑动到顶部，上拉加载更多
  messageStore.fetchMessageList();
};
</script>

<style lang="less" scoped>
.text-gray {
  color: var(--theme-text-gray);
}
</style>
