<template>
  <div
    v-if="props.status === MessageOperationStatus.Select"
    class="h-40 flex justify-center items-center gap-8 select-none"
  >
    <div class="select-operation" @click="shareTogether">
      <img src="@/assets/multi-share.png" />
      <div>合并转发</div>
    </div>
    <div class="select-operation" @click="shareOnebyOne">
      <img src="@/assets/single-share.png" />
      <div>逐条转发</div>
    </div>
    <div class="select-operation" @click="batchDeleteMessage">
      <img src="@/assets/delete-btn.png" />
      <div>删除</div>
    </div>
    <div class="select-operation" @click="closeSelectMessage">
      <img src="@/assets/close-btn.png" />
      <div>取消</div>
    </div>
  </div>
  <div
    v-else
    class="h-40 flex flex-col select-none"
    @dragleave="preventDefault"
    @dragover="preventDefault"
    @dragenter="preventDefault"
    @drop="handleDragFileSend"
  >
    <div class="px-2 flex justify-between">
      <div class="icons flex items-center">
        <el-popover placement="top" :width="360" trigger="click">
          <template #reference>
            <img src="@/assets/smile-icon.png" />
          </template>
          <template #default>
            <FXEmoji @select="selectEmoji" />
          </template>
        </el-popover>
        <img src="@/assets/shortcut-icon.png" @click="handleScreenshot" />
        <img src="@/assets/file-icon.png" @click="handleSendFile" />
        <img
          v-if="
            false &&
            !isSelfActive &&
            messageStore.activeRecordItem.conversationType ===
              ConversationType.IM_CVS_TYPE_C2C
          "
          src="@/assets/phone-icon.png"
          @click="openAudioCallDialog"
        />
        <img
          v-if="
            false &&
            !isSelfActive &&
            messageStore.activeRecordItem.conversationType ===
              ConversationType.IM_CVS_TYPE_C2C
          "
          src="@/assets/video-icon.png"
          @click="openVideoCallDialog"
        />
        <!-- <img src="@/assets/more-icon.png" /> -->
      </div>
      <MessageHistory />
    </div>
    <div
      ref="messageInputWrapperRef"
      class="input-wrapper px-3 flex-auto flex flex-col"
      @click="focusMessageInput"
      v-contextmenu:messageInputRef
    >
      <el-input
        id="message-input"
        ref="textareaRef"
        :modelValue="textarea"
        @update:model-value="handelMessageInput"
        :autosize="{ minRows: 1, maxRows: maxTextareaRows }"
        type="textarea"
        placeholder="请输入"
        @keyup.enter.exact="handleEnterKeyup"
        @keyup.meta.enter.exact="handleMetaEnterKeyup"
        @keyup.ctrl.enter.exact="handleCtrlEnterKeyup"
      />
      <div v-if="messageStore.referenceMessage" class="flex items-center">
        <div class="quoted-message-container">
          <div class="quoted-message-wrapper">
            {{ messageStore.referenceMessage.name }}：{{
              getMessagePreview(messageStore.referenceMessage)
            }}
          </div>
        </div>
        <img
          src="@/assets/close-btn.png"
          class="w-6 h-6 p-1 ml-2 cursor-pointer hover:bg-gray-200"
          @click="() => messageStore.setReferenceMessage(null)"
        />
      </div>
    </div>
    <div v-if="isWindows" class="absolute bottom-4 right-4">
      <el-button type="primary" round @click="handleSendMessage"
        >发送</el-button
      >
    </div>
  </div>
  <v-contextmenu ref="messageInputRef">
    <v-contextmenu-item @click="handleCopy">复制</v-contextmenu-item>
    <v-contextmenu-item @click="handleShear">剪切</v-contextmenu-item>
    <v-contextmenu-item @click="handlePaste">粘贴</v-contextmenu-item>
  </v-contextmenu>
  <AudioAndVideoCallDialog
    :visible="messageStore.isAudioAndVideoCallDialogVisible"
    @on-visible-change="handleVisibleChange"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageInput",
});
</script>

<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { ElMessage } from "element-plus";
import { get, throttle } from "lodash-es";
// import EditorInput from "@/components/EditorInput/index.vue";
import FXEmoji from "@/components/FXEmoji/index.vue";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import MessageHistory from "./MessageHistory.vue";
import { MessageOperationStatus } from "./type.d.ts";
import Tribute from "tributejs";
import { listGroupMemberV2 } from "@/api/message";
import {
  MessageContentType,
  ForwardType,
  CustomMessageType,
  VideoCallResult,
  ConversationType,
} from "@/types/message";
import {
  OPEN_FILE_SELECT_DIALOG,
  SCREENSHOTS,
  SEND_SCREENSHOT_IMG,
  WRITE_FILE,
} from "@/../../main/channel";
import AudioAndVideoCallDialog from "@/components/AudioAndVideoCallDialog/index.vue";
import { getVideoPreviewInfo } from "@/utils/videoHelper";
import { getMessagePreview } from "@/utils/message";
import {
  ENTER_KEY_NAME,
  CTRL_ENTER_KEY_NAME,
  COMMAND_ENTER_KEY_NAME,
  SEND_MESSAGE_ITEM_NAME,
} from "@/constant/message";
import { isImg, isVideo, isAudio } from "@/utils/img";

interface Props {
  status: MessageOperationStatus;
}

const props = defineProps<Props>();
const emits = defineEmits([
  "on-change-status",
  "on-send-message",
  "on-forward-message",
]);

const userStore = useUserStore();
const messageStore = useMessageStore();

const isSelfActive = computed(() => {
  return messageStore.activeRecordId === userStore.userId;
});

const isWindows = computed(() => window["$platform"] === "win32");

const textareaRef = ref();
const textarea = ref(messageStore.activeRecordItem.draftText || "");
const selectionStart = ref(0); // 记录光标位置
const handelMessageInput = (val: string, e: any) => {
  if (val === "\n") return;

  selectionStart.value = (
    document.querySelector("#message-input") as HTMLInputElement
  ).selectionStart as number;
  console.log("光标位置", selectionStart.value);

  if (val.length < textarea.value.length) {
    // 删除操作：整体删除@人员
    const mentionPosition = findMentionPosition(
      textarea.value,
      selectionStart.value
    );
    if (mentionPosition) {
      const { start, end } = mentionPosition;
      const mentionUser = textarea.value.slice(start, end);
      if (mentionUserMap.value[mentionUser]) {
        mentionUserMap.value[mentionUser].pop();
        if (mentionUserMap.value[mentionUser].length === 0) {
          delete mentionUserMap.value[mentionUser];
        }
      }
      console.error("删除@人员", mentionUser, mentionUserMap.value);
    }
  }
  textarea.value = val;
};

const isInputLock = ref(false);
const handleCompositionStart = () => {
  isInputLock.value = true;
};
const handleCompositionEnd = () => {
  // 中文输入法组词阶段按回车键只触发input事件 不发送消息
  // 参考：https://cloud.tencent.com/developer/news/898348
  setTimeout(() => {
    isInputLock.value = false;
  }, 200);
};

const preventDefault = (e: any) => {
  e.preventDefault();
  return false;
};
// 每秒保存一次草稿
const saveDraft = throttle(() => {
  const {
    conversationId,
    conversationType,
    conversationName,
    conversationAvatar,
  } = messageStore.activeRecordItem;
  const conv = {
    conversationId,
    conversationType,
    conversationName,
    conversationAvatar,
  };
  window.$imRender.saveConversationDraft({
    convStr: JSON.stringify(conv),
    draft: textarea.value,
  });
}, 1000);
watch(
  () => textarea.value,
  () => {
    // 输入框内容变化，立即存草稿
    saveDraft();
  }
);

const openAudioCallDialog = () => openAudioAndVideoCallDialog(true);
const openVideoCallDialog = () => openAudioAndVideoCallDialog(false);
const openAudioAndVideoCallDialog = (isAudioCall: boolean) => {
  const customContent = {
    type: CustomMessageType.VIDEO_CALL_REQUEST,
    isAudioCall,
    isGroup: false,
    targetId: userStore.userId,
    replyId: userStore.userId,
    inviteeIds: [messageStore.activeRecordId], // 被邀请人的ID列表
  };
  window.$imRender
    .sendCustomMessage({
      content: { text: JSON.stringify(customContent), isNotice: true },
      receiver: messageStore.activeRecordId,
      isGroup: null,
    })
    .then((data: any) => {
      messageStore.setAudioAndVideoCallRequestMessageContent(customContent);
      messageStore.setIsAudioAndVideoCallRequestVisible(true);
      messageStore.audioAndVideoCallRequestTimer = setTimeout(() => {
        // 一分钟无应答，主动关闭音视频邀请
        const customContent = {
          type: VideoCallResult.REJECT,
          rejectId: userStore.userId,
        };
        window.$imRender.sendCustomMessage({
          content: { text: JSON.stringify(customContent) },
          receiver: messageStore.activeRecordId,
          isGroup: null,
        });
        messageStore.setIsAudioAndVideoCallRequestVisible(false);
      }, 60 * 1000);
    });
};
const handleVisibleChange = (val: boolean) => {
  messageStore.setAudioAndVideoCallDialogVisible(val);
};

// 处理输入框高度根据是否有引用消息去自适应
const maxTextareaRows = ref(5);
watch(
  () => messageStore.referenceMessage,
  () => {
    if (!messageStore.referenceMessage) {
      maxTextareaRows.value = 5;
    } else if (messageStore.referenceMessage.content.length < 28) {
      maxTextareaRows.value = 3;
    } else {
      maxTextareaRows.value = 2;
    }
  }
);
watch(
  () => messageStore.referenceMessage,
  () => {
    // 触发input高度变化并focus
    const curText = textarea.value;
    textarea.value = curText + " ";
    nextTick(() => {
      textarea.value = curText;
      textareaRef.value.focus();
    });
  }
);

const mentionUserMap = ref<any>({});
const onGroupNotify = (e: any) => {
  const { original } = e.detail.item;
  if (!mentionUserMap.value[`@${original.realName}`]) {
    mentionUserMap.value[`@${original.realName}`] = [original.userId];
  } else {
    mentionUserMap.value[`@${original.realName}`].push(original.userId);
  }
  console.log("新增@人员", original.realName, mentionUserMap.value);
};

const findMentionPosition = (text: string, curPosition: number) => {
  // @人员开始和结束位置
  let start = curPosition;
  let end = curPosition;

  // 从当前光标位置往前搜索 搜索到@结束
  while (start >= 0) {
    if (text[start] === "@" || text[start] === " ") {
      break;
    }
    start = start - 1;
  }
  if (text[start] !== "@") {
    // 没找到@终止
    return null;
  }

  // 从当前光标位置往后搜索 搜索到空格结束
  while (end < text.length) {
    if (text[end] === " ") {
      break;
    }
    end = end + 1;
  }
  if (text[end] !== " ") {
    // 没找到空格终止
    return null;
  }

  return { start, end };
};

const onMentionUserSelect = () => {
  selectionStart.value = inputDom.selectionStart;
  const mentionPosition = findMentionPosition(
    textarea.value,
    selectionStart.value
  );
  if (!mentionPosition) return;
  // 选中@人员
  inputDom.setSelectionRange(mentionPosition.start, mentionPosition.end);
};

const handleDragFileSend = (e: any) => {
  const fileList = e.dataTransfer.files;
  if (fileList.length > 9) {
    ElMessage.warning({ message: "一次最多只能发送9个文件" });
    return;
  }
  console.log("handleDragFileSend", fileList);
  Object.values(fileList).forEach(async ({ path, name, size, type }: any) => {
    if (!path) return;
    const fileType = type.split("/")[1];
    if (isImg(fileType)) {
      emits("on-send-message", {
        type: MessageContentType.Image,
        params: {
          imagePath: path,
          thumbnailPath: path,
        },
      });
      return;
    }
    if (isVideo(fileType)) {
      // 发送视频
      const { duration, url } = await getVideoPreviewInfo(`local:///${path}`);
      console.log("视频时长", duration);
      const snapShotPath = await window.ipcRenderer.invoke(WRITE_FILE, url);
      console.log("视频第一帧截图保存路径", snapShotPath);
      emits("on-send-message", {
        type: MessageContentType.Video,
        params: {
          videoPath: path,
          snapShotPath,
          duration,
        },
      });
      return;
    }
    if (isAudio(fileType)) {
      // 发送音频
      const { duration, url } = await getVideoPreviewInfo(`local:///${path}`);
      console.log("音频时长", duration);
      emits("on-send-message", {
        type: MessageContentType.Audio,
        params: {
          audioPath: path,
          duration,
        },
      });
      return;
    }
    // 发送文件
    emits("on-send-message", {
      type: MessageContentType.File,
      params: {
        filePath: path,
        fileName: name,
        size,
      },
    });
  });
};

let inputDom: any;
let tribute: any;
onMounted(async () => {
  inputDom = document.getElementById("message-input");
  if (inputDom) {
    inputDom.addEventListener("tribute-replaced", onGroupNotify);
    inputDom.addEventListener("click", onMentionUserSelect);
    inputDom.addEventListener("compositionstart", handleCompositionStart);
    inputDom.addEventListener("compositionend", handleCompositionEnd);
  }

  const { items } = await listGroupMemberV2({
    groupId: messageStore.activeRecordItem.conversationId,
    userId: userStore.userId,
    pageNum: 1,
    pageSize: 100000,
  });

  if (
    messageStore.activeRecordItem.conversationType ===
    ConversationType.IM_CVS_TYPE_GROUP
  ) {
    // 注册群组@功能
    tribute = new Tribute({
      trigger: "@",
      selectClass: "message-tribute-highlight",
      containerClass: "message-tribute-container",
      lookup: "realName",
      fillAttr: "realName",
      menuItemTemplate: function (item) {
        const avatar =
          item.original.avatar ||
          "data:image/png;base64,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";
        return `<img style="width:20px;height:20px;border-radius:50%;margin-right:8px;background:#ddd;" src="${get(
          window.__GLOBAL_AVATAR_CACHE__,
          avatar,
          avatar
        )}" /><span>${item.string}</span>`;
      },
      noMatchTemplate: function () {
        return '<span style:"visibility: hidden;"></span>';
      },
      selectTemplate: function (item: any) {
        return "@" + item.original.realName;
      },
      values: [
        { avatar: "", realName: "所有人", userId: "__kImSDK_MessageAtALL__" },
        ...items,
      ].map((item: any) => ({ ...item, ...item.user })),
    });

    tribute.attach(inputDom);
  }
});
onUnmounted(() => {
  if (inputDom) {
    inputDom.removeEventListener("tribute-replaced", onGroupNotify);
    inputDom.removeEventListener("click", onMentionUserSelect);
    inputDom.removeEventListener("compositionstart", handleCompositionStart);
    inputDom.removeEventListener("compositionend", handleCompositionEnd);
  }
});

const focusMessageInput = () => {
  if (textareaRef.value) {
    textareaRef.value.focus();
  }
};

const handleSendMessageKeyup = (key: string) => {
  const SEND_MESSAGE_KEY =
    localStorage.getItem(SEND_MESSAGE_ITEM_NAME) ?? ENTER_KEY_NAME;
  if (SEND_MESSAGE_KEY === key) {
    handleSendMessage();
  } else if (key !== ENTER_KEY_NAME) {
    textarea.value += "\n";
  }
};
const handleEnterKeyup = () => {
  handleSendMessageKeyup(ENTER_KEY_NAME);
};
const handleMetaEnterKeyup = () => {
  handleSendMessageKeyup(COMMAND_ENTER_KEY_NAME);
};
const handleCtrlEnterKeyup = () => {
  handleSendMessageKeyup(CTRL_ENTER_KEY_NAME);
};

const handleSendMessage = () => {
  const text = textarea.value.trim();
  if (!text || isInputLock.value) return;
  // 构造消息体
  emits("on-send-message", {
    type: messageStore.referenceMessage
      ? MessageContentType.Custom
      : MessageContentType.Text,
    params: {
      text,
      userList: Object.values(mentionUserMap.value).map((arr: any) => arr[0]),
    },
  });
  textarea.value = "";
  mentionUserMap.value = {};
  messageStore.setReferenceMessage(null);
};
const handleSendFile = async () => {
  const {
    filePath,
    fileName,
    size = 0,
  } = await window.ipcRenderer.invoke(OPEN_FILE_SELECT_DIALOG);
  console.log("handleSendFile", { filePath, fileName, size });
  if (!filePath) return;
  if (
    filePath.endsWith(".jpg") ||
    filePath.endsWith(".png") ||
    filePath.endsWith(".jpeg") ||
    filePath.endsWith(".gif") ||
    filePath.endsWith(".bmp") ||
    filePath.endsWith(".webp")
  ) {
    // 发送图片
    emits("on-send-message", {
      type: MessageContentType.Image,
      params: {
        imagePath: filePath,
        thumbnailPath: filePath, // TODO:缩略图路径
      },
    });
    return;
  }
  if (
    filePath.endsWith(".mp4") ||
    filePath.endsWith(".flv") ||
    filePath.endsWith(".avi") ||
    filePath.endsWith(".mov")
  ) {
    // 发送视频
    const { duration, url } = await getVideoPreviewInfo(`local:///${filePath}`);
    console.log("视频时长", duration);
    const snapShotPath = await window.ipcRenderer.invoke(WRITE_FILE, url);
    console.log("视频第一帧截图保存路径", snapShotPath);
    emits("on-send-message", {
      type: MessageContentType.Video,
      params: {
        videoPath: filePath,
        snapShotPath,
        duration,
      },
    });
    return;
  }
  if (
    filePath.endsWith(".mp3") ||
    filePath.endsWith(".wav") ||
    filePath.endsWith(".pcm")
  ) {
    // 发送音频
    const { duration, url } = await getVideoPreviewInfo(`local:///${filePath}`);
    console.log("音频时长", duration);
    emits("on-send-message", {
      type: MessageContentType.Audio,
      params: {
        audioPath: filePath,
        duration,
      },
    });
    return;
  }
  // 发送文件
  emits("on-send-message", {
    type: MessageContentType.File,
    params: {
      filePath,
      fileName,
      size,
    },
  });
};

const selectEmoji = (emoji: string) => {
  textarea.value += emoji;
};

const closeSelectMessage = () => {
  (messageStore.activeRecordItem.messageContentList || []).forEach(
    (item: any) => {
      if (item.checked) {
        item.checked = false;
      }
    }
  );
  emits("on-change-status", MessageOperationStatus.Input);
};

const handleScreenshot = () => {
  window.ipcRenderer.send(SCREENSHOTS);
  window.ipcRenderer.once(
    SEND_SCREENSHOT_IMG,
    (_event, { screenshotsPath }) => {
      console.log("发送截图", screenshotsPath);
      emits("on-send-message", {
        type: MessageContentType.Image,
        params: {
          imagePath: screenshotsPath,
          thumbnailPath: screenshotsPath, // TODO:缩略图路径
        },
      });
    }
  );
};

// 合并转发
const shareTogether = () => {
  emits("on-forward-message", { type: ForwardType.Together });
  emits("on-change-status", MessageOperationStatus.Input);
};
// 逐条转发
const shareOnebyOne = () => {
  emits("on-forward-message", { type: ForwardType.OneByOne });
  emits("on-change-status", MessageOperationStatus.Input);
};

const batchDeleteMessage = () => {
  const selectedMessageList = (
    messageStore.activeRecordItem.messageContentList || []
  ).filter((item: any) => item.checked && item.mid);
  console.log("批量删除消息", selectedMessageList);
  selectedMessageList.forEach((item: any) => {
    window.$imRender
      .delMsgByMsgID(item.mid)
      .then(({ data }: any) => {
        if (data) {
          console.log("删除消息成功", item);
          messageStore.delMessageContent(item.mid);
        } else {
          console.error("delete message failed: ", data);
        }
      })
      .catch((err: any) => {
        console.error("delete message error: ", item, err);
      });
  });
  emits("on-change-status", MessageOperationStatus.Input);
};

const messageInputWrapperRef = ref();
let selectionText = "";
const handleSelectText = () => {
  const selection = window.getSelection();
  if (selection) {
    selectionText = selection.toString();
  }
};
onMounted(() => {
  if (messageInputWrapperRef.value) {
    messageInputWrapperRef.value.addEventListener(
      "contextmenu",
      handleSelectText
    );
  }
});
onBeforeUnmount(() => {
  if (messageInputWrapperRef.value) {
    messageInputWrapperRef.value.removeEventListener(
      "contextmenu",
      handleSelectText
    );
  }
});

const messageInputRef = ref();
const handleCopy = () => {
  navigator.clipboard.writeText(selectionText);
};
const handleShear = () => {
  navigator.clipboard.writeText(selectionText);
  // TODO:@人员的剪切处理
  textarea.value = textarea.value.replace(selectionText, "");
};
const handlePaste = () => {
  navigator.permissions
    .query({
      name: "clipboard-read",
    })
    .then((result) => {
      if (result.state == "granted" || result.state == "prompt") {
        //读取剪贴板
        navigator.clipboard.readText().then((text) => {
          textarea.value = textarea.value + text;
        });
      } else {
        ElMessage.warning({ message: "请允许读取剪贴板！" });
      }
    });
};
// const handleDelete = () => {
//   textarea.value = "";
//   mentionUserMap.value = {};
//   messageStore.setReferenceMessage(null);
// };
</script>

<style lang="less" scoped>
.select-operation {
  @apply w-20 p-2 flex flex-col items-center cursor-pointer rounded-md hover:bg-gray-200;
  & > img {
    @apply w-6 mb-4;
  }
}

.icons {
  img {
    @apply w-6 p-1 mr-2 cursor-pointer rounded-md;
    &:hover {
      background: #e3e3e3;
    }
  }
}

.input-wrapper {
  :deep(.el-textarea__inner) {
    background: transparent;
    border: none;
    resize: none;
    font-size: 16px;
    box-shadow: none;
    &:hover {
      box-shadow: none;
    }
  }
}

.quoted-message-container {
  padding: 8px 20px;
  background: #e3e3e3;
  border-radius: 0px 6px 6px 6px;
  .quoted-message-wrapper {
    max-width: 400px;
    font-size: 14px;
    color: #666;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    word-break: break-all;
  }
}
</style>

<style lang="less">
.message-tribute-container {
  max-height: 162px;
  overflow-y: auto;
  overflow-x: hidden;
  @apply bg-white;
  li {
    @apply py-1 px-2 flex items-center hover:text-primary;
  }
  li + li {
    margin-top: 4px;
  }
}
.message-tribute-highlight {
  @apply cursor-pointer hover:bg-gray-200;
}
</style>
