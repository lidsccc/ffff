<template>
  <div class="message-display h-full flex flex-col overflow-hidden">
    <div
      class="message-top w-full px-5 flex justify-between items-center"
      :class="isWindows ? 'window-size-header' : ''"
    >
      <div class="title truncate flex justify-between items-center select-none">
        {{ conversationName }}
      </div>
      <GroupSettingDrawer
        v-if="
          messageStore.activeRecordItem.conversationType ===
          ConversationType.IM_CVS_TYPE_GROUP
        "
        :groupId="messageStore.activeRecordItem.conversationId"
        @on-group-change="handleGroupChange"
      />
      <UserSettingDrawer v-else />
    </div>
    <div
      ref="messageBubbleWrapperRef"
      class="border-t border-b flex-auto overflow-auto px-2 relative"
    >
      <div v-if="globalStore.isNetworkOffline" class="offline-tip">
        当前网络不可用，需检查你的网络设置。
      </div>
      <div v-else-if="globalStore.isImSDKOffline" class="offline-tip">
        连接已断开
      </div>
      <virtual-list
        class="message-dialog-container h-full overflow-y-auto relative"
        ref="vsl"
        :keeps="20"
        data-key="mid"
        :data-sources="props.list"
        @resized="onItemRendered"
        @totop="onTotop"
      >
        <template #default="{ source, index }">
          <div
            v-if="
              props.status === MessageOperationStatus.Select &&
              source.msgStatus !== MessageSendStatus.Recall &&
              source.msgType !== MessageContentType.GROUP_NOTICE
            "
          >
            <el-checkbox
              v-model="source.checked"
              @change="(val: boolean) => (source.checked = val)"
              class="message-checkbox"
            >
              <MessageBubble
                :select="true"
                :detail="source"
                :showTime="showMessageTime(source, props.list[index + 1])"
              />
            </el-checkbox>
          </div>
          <div
            v-else
            v-contextmenu:messageContentRef
            @contextmenu.prevent="handleContextMenuShow(source)"
          >
            <MessageBubble
              :detail="source"
              :showTime="showMessageTime(source, props.list[index + 1])"
            />
          </div>
        </template>
      </virtual-list>
      <v-contextmenu ref="messageContentRef">
        <v-contextmenu-item v-if="showQuote" @click="handleQuote"
          >回复</v-contextmenu-item
        >
        <v-contextmenu-item v-if="showSave" @click="handleSave"
          >存储...</v-contextmenu-item
        >
        <v-contextmenu-item v-if="showCopy" @click="handleCopy"
          >复制</v-contextmenu-item
        >
        <v-contextmenu-item v-if="showShare" @click="handleShare"
          >转发</v-contextmenu-item
        >
        <v-contextmenu-item v-if="showRevoke" @click="handleRecallMessage"
          >撤回</v-contextmenu-item
        >
        <v-contextmenu-item v-if="showSelect" @click="handleSelectMessage"
          >多选</v-contextmenu-item
        >
        <!-- <v-contextmenu-item>保存</v-contextmenu-item> -->
        <v-contextmenu-item v-if="showDelete" @click="handleDeleteMessage"
          >删除</v-contextmenu-item
        >
      </v-contextmenu>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageDisplay",
});
</script>

<script lang="ts" setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { get } from "lodash-es";
import MessageBubble from "./MessageBubble.vue";
import UserSettingDrawer from "./UserSettingDrawer.vue";
import GroupSettingDrawer from "./GroupSettingDrawer.vue";
import { MessageOperationStatus, MessageBubbleType } from "./type.d.ts";
import {
  ForwardType,
  ConversationType,
  MessageContentType,
  MessageEvent,
  MessageSendStatus,
} from "@/types/message";
import { getMessageContent } from "@/utils/message";
import { useMessageStore } from "@/store/modules/message";
import { useUserStore } from "@/store/modules/user";
import { useGlobalStore } from "@/store/modules/global";
import { ElMessage, ElMessageBox } from "element-plus";
import { listGroupMemberV2 } from "@/api/message";
import { FILE_DOWNLOAD } from "@/../../main/channel";

const messageStore = useMessageStore();
const userStore = useUserStore();
const globalStore = useGlobalStore();

interface Props {
  list: MessageBubbleType[];
  status: MessageOperationStatus;
}

const props = defineProps<Props>();
const emits = defineEmits([
  "on-change-status",
  "on-recall-message",
  "on-forward-message",
  "on-send-message",
]);

const isWindows = computed(() => window["$platform"] === "win32");

const vsl = ref();
const onItemRendered = () => {
  // 首次加载 消息滚动到最新一条（底部）
  if (
    props.list.length <= 20 &&
    vsl.value.getSizes() >=
      (messageStore.activeRecordItem.messageContentList || []).length
  ) {
    console.log("onItemRendered: 首次加载 滚动到底部");
    setVirtualListToBottom();
  }
};
const setVirtualListToBottom = () => {
  if (vsl.value) {
    vsl.value.scrollToBottom();
  }
};
const loading = ref(false);
const onTotop = async () => {
  if (loading.value) return;
  // 滑动到顶部，上拉加载更多
  loading.value = true;
  console.log("上拉加载更多");
  const list = await messageStore.fetchMessageList();
  loading.value = false;
  nextTick(() => {
    if (list.length >= 20) {
      vsl.value.scrollToIndex(20);
    }
  });
};

const messageContentRef = ref();
const currentContextMenuItem = ref<any>({});
const handleContextMenuShow = (item: any) => {
  currentContextMenuItem.value = { ...item };
};

const showMessageTime = (
  message: any,
  nextMessage = { sendTime: Math.round(Date.now() / 1000) }
) => {
  const { sendTime } = message;
  const { sendTime: nextSendTime } = nextMessage;
  // 间隔5分钟内的消息不展示时间
  return nextSendTime - sendTime > 5 * 60;
};

const showQuote = computed(() => {
  const { msgType, msgStatus } = currentContextMenuItem.value;
  if (msgStatus === MessageSendStatus.Recall) {
    return false;
  }
  return [
    MessageContentType.Text,
    MessageContentType.Image,
    MessageContentType.Audio,
    MessageContentType.Video,
    MessageContentType.Location,
    MessageContentType.File,
    MessageContentType.Article,
    MessageContentType.Merger,
  ].includes(msgType);
});
const showSave = computed(() => {
  const { msgType, msgStatus } = currentContextMenuItem.value;
  if (msgStatus === MessageSendStatus.Recall) {
    return false;
  }
  return [MessageContentType.Image].includes(msgType);
});
const showCopy = computed(() => {
  const { msgType, msgStatus } = currentContextMenuItem.value;
  if (msgStatus === MessageSendStatus.Recall) {
    return false;
  }
  return msgType === MessageContentType.Text;
});
const showShare = computed(() => {
  const { msgType, msgStatus } = currentContextMenuItem.value;
  if (msgStatus === MessageSendStatus.Recall) {
    return false;
  }
  return (
    msgType !== MessageContentType.GROUP_NOTICE &&
    msgType !== MessageContentType.Custom
  );
});
const showRevoke = computed(() => {
  const { sendTime = 0, from, msgStatus } = currentContextMenuItem.value;
  if (msgStatus === MessageSendStatus.Recall) {
    return false;
  }
  if (from === userStore.userId && Date.now() - sendTime * 1000 < 60 * 1000) {
    // 小于一分钟的消息可以撤回
    return true;
  }
  return false;
});
const showSelect = computed(() => {
  const { msgType, msgStatus } = currentContextMenuItem.value;
  if (msgStatus === MessageSendStatus.Recall) {
    return false;
  }
  return (
    msgType !== MessageContentType.GROUP_NOTICE &&
    msgType !== MessageContentType.Custom
  );
});
const showDelete = computed(() => {
  const { msgType, msgStatus } = currentContextMenuItem.value;
  if (msgStatus === MessageSendStatus.Recall) {
    return false;
  }
  return msgType !== MessageContentType.GROUP_NOTICE;
});

watch(
  () => messageStore.activeRecordId,
  () => {
    // 切换聊天对象自动下拉到最新一条消息
    console.log("切换会话", messageStore.activeRecordItem.conversationName);
    nextTick(() => {
      setVirtualListToBottom();
      setTimeout(() => {
        setVirtualListToBottom();
      }, 100);
    });
  }
);

// 来新消息或者发送一条消息 自动滚动到当前那条消息
watch(
  () => get(messageStore, "activeRecordItem.messageContentList", []),
  (newValue = [], oldValue = []) => {
    const newLastMsg = newValue[newValue.length - 1];
    const oldLastMsg = oldValue[oldValue.length - 1];
    if (newLastMsg?.mid === oldLastMsg?.mid) {
      // 不是收到一条消息或发送一条消息 忽略
      return;
    }

    const messageContentList =
      messageStore.activeRecordItem.messageContentList || [];
    const msgListLen = messageContentList.length;
    let lastMsg;
    if (msgListLen > 0) {
      lastMsg = messageContentList[msgListLen - 1];
    }
    if (!lastMsg) {
      return;
    }
    if (
      lastMsg.to === userStore.userId ||
      lastMsg.to === messageStore.activeRecordId ||
      lastMsg.from === userStore.userId
    ) {
      // TODO:fix
      if (vsl.value) {
        vsl.value.scrollToOffset(vsl.value.getOffset() - 1);
      }
      nextTick(() => {
        setVirtualListToBottom();
        setTimeout(() => {
          setVirtualListToBottom();
        }, 100);
      });
    }
  }
);

// 来新消息了 并且是当前选中的会话 自动把新消息设置为已读
watch(
  () => get(messageStore, "activeRecordItem.messageContentList", []).length,
  (newValue, oldValue) => {
    if (newValue - oldValue !== 1) {
      // 不是收到一条消息 忽略
      return;
    }

    const messageContentList =
      messageStore.activeRecordItem.messageContentList || [];
    const msgListLen = messageContentList.length;
    let lastMsg;
    if (msgListLen > 0) {
      lastMsg = messageContentList[msgListLen - 1];
    }
    console.log("lastMsg", lastMsg);
    // TODO:怎么过滤下拉加载了一条消息
    const isGroup = lastMsg.event === MessageEvent.GroupChat;
    if (
      lastMsg.mid &&
      (lastMsg.to === isGroup
        ? messageStore.activeRecordId
        : userStore.userId) &&
      lastMsg.from !== userStore.userId
    ) {
      // console.log("设置最新一条消息已读");
      // 来新消息了 自动把最新一条消息设置已读(自己发送的消息除外)
      window.$imRender.sendReadReceipt({
        msgID: lastMsg.mid,
        chatID: messageStore.activeRecordId,
        isGroup,
      });
    }
  }
);

const handleSelectMessage = () => {
  emits("on-change-status", MessageOperationStatus.Select);
};

const handleRecallMessage = () => {
  // 撤回失败提示message
  emits("on-recall-message", { ...currentContextMenuItem.value });
};

// 复制选中文本
const messageBubbleWrapperRef = ref();
let selectionText = "";
const handleSelectText = () => {
  const selection = window.getSelection();
  if (selection) {
    selectionText = selection.toString();
  }
};
onMounted(() => {
  if (messageBubbleWrapperRef.value) {
    messageBubbleWrapperRef.value.addEventListener(
      "contextmenu",
      handleSelectText
    );
  }
});
onBeforeUnmount(() => {
  if (messageBubbleWrapperRef.value) {
    messageBubbleWrapperRef.value.removeEventListener(
      "contextmenu",
      handleSelectText
    );
  }
});

const handleCopy = async () => {
  try {
    const text =
      selectionText || getMessageContent(currentContextMenuItem.value);
    return await navigator.clipboard.writeText(text);
  } catch (error) {
    ElMessage.error({ message: `复制失败：${error}` });
  }
};

const handleShare = async () => {
  emits("on-forward-message", {
    type: ForwardType.Single,
    value: { ...currentContextMenuItem.value },
  });
};

const handleQuote = () => {
  // console.log("引用消息", currentContextMenuItem.value);
  messageStore.setReferenceMessage({ ...currentContextMenuItem.value });
};
const handleSave = () => {
  const mid = get(currentContextMenuItem.value, "mid");
  const content = get(currentContextMenuItem.value, "content");
  let fileName: any;
  try {
    fileName = JSON.parse(content).name;
  } catch (err) {
    window.$log.error("解析图片信息错误:", err);
  }
  if (!mid || !fileName) {
    ElMessage.error("图片信息异常,下载失败");
    return;
  }
  window.$imRender.downloadFile({
    messageId: mid,
    isOriginalFile: true,
    callback: ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        try {
          const { savedPath } = JSON.parse(jsonParams);
          window.ipcRenderer.send(FILE_DOWNLOAD, {
            downloadPath: `local:///${savedPath}`,
            fileName,
          });
        } catch (err) {
          window.$log.error("下载原图结果解析出错：", err);
        }
      } else {
        ElMessage.error(`图片下载失败：${desc}`);
      }
    },
  });
};
const handleDeleteMessage = () => {
  const mid = get(currentContextMenuItem.value, "mid");
  if (!mid) {
    return;
  }
  ElMessageBox.confirm("删除此条消息？").then(() => {
    window.$imRender
      .delMsgByMsgID(mid)
      .then(({ data }: any) => {
        if (data) {
          messageStore.delMessageContent(mid);
        } else {
          window.$log.error("delete message failed: ", data);
        }
      })
      .catch((err: any) => {
        window.$log.error("delete message error: ", err);
      });
  });
};

const groupMember = ref<any[]>([]);
const handleGroupChange = () => {
  // 群详情变化
  fetchGroupMember();
};
const conversationName = computed(() => {
  let conversationName =
    messageStore.activeRecordItem.conversationName ||
    messageStore.activeRecordItem.conversationId;
  if (
    messageStore.activeRecordItem.conversationType ===
      ConversationType.IM_CVS_TYPE_GROUP &&
    groupMember.value.length > 0
  ) {
    conversationName = `${conversationName.slice(0, 20)}${
      conversationName.length > 20 ? "..." : ""
    }(${groupMember.value.length}人)`;
  }
  return conversationName;
});
const fetchGroupMember = () => {
  if (
    messageStore.activeRecordItem.conversationType ===
    ConversationType.IM_CVS_TYPE_GROUP
  ) {
    listGroupMemberV2({
      groupId: messageStore.activeRecordItem.conversationId,
      userId: userStore.userId,
      pageNum: 1,
      pageSize: 1000000,
    }).then(({ items }) => {
      groupMember.value = items;
    });
  }
};

watch(
  () => messageStore.activeRecordItem.conversationId,
  () => {
    fetchGroupMember();
  }
);
fetchGroupMember();
// const updateGroupMember = (list: any[]) => {
//   groupMember.value = list;
// };
</script>

<style lang="less" scoped>
.message-display {
  .message-top {
    box-sizing: border-box;
    height: var(--content-header-height);
  }
  .window-size-header {
    padding-top: var(--layout-window-size-height);
  }
  .message-dialog-container::-webkit-scrollbar {
    display: none;
  }
  .title {
    height: var(--content-header-height);
    max-width: 80%;
    color: rgba(0, 0, 0, 0.85);
    font-size: 18px;
    line-height: 48px;
  }
}

.message-checkbox {
  display: flex;
  align-items: flex-start;
  height: 100%;
  white-space: normal;
  :deep(.el-checkbox__label) {
    flex: 1;
  }
  :deep(.el-checkbox__input) {
    display: block;
    margin-top: 25px;
    border-radius: 50%;
  }
  :deep(.el-checkbox__inner) {
    border-radius: 50%;
  }
}

.offline-tip {
  @apply absolute inset-x-0 top-0 h-8 flex justify-center items-center bg-red-100 text-gray-500 text-xs;
  z-index: 9999;
}
</style>
