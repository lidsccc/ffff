<template>
  <div class="toolbar relative">
    <Toolbar
      ref="toolbarRef"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      @click="handleToolbarClick"
    />
    <div class="absolute right-0 top-0">
      <MessageHistory />
    </div>
  </div>
  <div
    class="h-[129px] overflow-y-auto"
    @click="handleClickEditor"
    ref="messageInputWrapperRef"
    v-contextmenu:messageInputRef
  >
    <div class="editor">
      <Editor
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @on-created="handleCreated"
        @on-change="handleEditorContentChange"
        @keyup.enter.exact="handleEnterKeyup"
        @keyup.meta.enter.exact="handleMetaEnterKeyup"
        @keyup.ctrl.enter.exact="handleCtrlEnterKeyup"
      />
      <ReferenceMessage />
    </div>
    <div v-if="isWindows" class="absolute bottom-4 right-4">
      <el-button type="primary" round @click="sendMessage">发送</el-button>
    </div>
  </div>
  <v-contextmenu ref="messageInputRef">
    <v-contextmenu-item @click="handleCopy">复制</v-contextmenu-item>
    <v-contextmenu-item @click="handleShear">剪切</v-contextmenu-item>
    <v-contextmenu-item @click="handlePaste">粘贴</v-contextmenu-item>
  </v-contextmenu>
  <mention-modal
    v-if="isGroupConversation && isShowMentionModal"
    :mentionList="mentionList"
    @hide-mention-modal="hideMentionModal"
    @insert-mention="insertMention"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "InputOperation",
});
</script>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef, computed } from "vue";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { DomEditor, IDomEditor, Boot, IEditorConfig } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import mentionModule, { MentionElement } from "@wangeditor/plugin-mention";
import MentionModal from "./MentionModal.vue";
import { listGroupMemberV2 } from "@/api/message";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import type { MentionUser } from "./type";
import { throttle } from "lodash-es";
import { ScreenshotsMenu, FileMenu } from "./CustomMenu";
import { ConversationType, MessageContentType } from "@/types/message";
import {
  ENTER_KEY_NAME,
  CTRL_ENTER_KEY_NAME,
  COMMAND_ENTER_KEY_NAME,
  SEND_MESSAGE_ITEM_NAME,
} from "@/constant/message";
import ReferenceMessage from "./ReferenceMessage.vue";
import MessageHistory from "@/components/MessageDetail/MessageHistory.vue";
import { QUICK_SCREENSHOTS } from "@/../../main/channel";

enum EditorMode {
  Simple = "simple",
  Default = "default",
}

enum MenuKeys {
  Screenshots = "Screenshots",
  File = "File",
}

enum ModuleKeys {
  MentionModule = "MentionModule",
  CtrlEnterModule = "CtrlEnterModule",
}

const userStore = useUserStore();
const messageStore = useMessageStore();
const isWindows = computed(() => window["$platform"] === "win32");
const isGroupConversation = computed(
  () =>
    messageStore.activeRecordItem.conversationType ===
    ConversationType.IM_CVS_TYPE_GROUP
);

const emits = defineEmits(["on-send-message"]);

const mode = ref(EditorMode.Simple);
const toolbarRef = ref();
const toolbarConfig = {
  toolbarKeys: ["emotion"],
  insertKeys: {
    index: 1,
    keys: [MenuKeys.Screenshots, MenuKeys.File],
  },
};
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  autoFocus: true,
  scroll: false,
  EXTEND_CONF: {
    mentionConfig: {
      showModal: showMentionModal, // 必须
      hideModal: hideMentionModal, // 必须
    },
  },
};

// 注册, 要在创建编辑器之前注册，且只能注册一次，不可重复注册。
const registerMenu = (key: string, MenuClass: any) => {
  if (!window.__WANG_EDITOR_REGISTERED_MENU__) {
    window.__WANG_EDITOR_REGISTERED_MENU__ = [];
  }
  if (!window.__WANG_EDITOR_REGISTERED_MENU__.includes(key)) {
    window.__WANG_EDITOR_REGISTERED_MENU__.push(key);
    const menuConf = {
      key,
      factory() {
        return new MenuClass({ emits });
      },
    };
    Boot.registerMenu(menuConf);
  }
};
registerMenu(MenuKeys.Screenshots, ScreenshotsMenu);
registerMenu(MenuKeys.File, FileMenu);

const registerModule = (key: string, module: any) => {
  if (!window.__WANG_EDITOR_REGISTERED_MODULE__) {
    window.__WANG_EDITOR_REGISTERED_MODULE__ = [];
  }
  if (!window.__WANG_EDITOR_REGISTERED_MODULE__.includes(key)) {
    window.__WANG_EDITOR_REGISTERED_MODULE__.push(key);
    Boot.registerModule(module);
  }
};
if (isGroupConversation.value) {
  // 群聊注册 @提及 插件
  registerModule(ModuleKeys.MentionModule, mentionModule);
}

// 内容 HTML
const valueHtml = ref(messageStore.activeRecordItem.draftText || "");

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

// 注册换行
const registerInsertBreak = (editor: IDomEditor) => {
  const { insertBreak } = editor;
  setTimeout(() => {
    // beforeInput 事件不能识别 ctrl+enter ，所以自己绑定 DOM 事件
    const { $textArea } = DomEditor.getTextarea(editor);
    if ($textArea == null) return;
    $textArea.on("keydown", (e) => {
      const event = e as KeyboardEvent;
      const isCtrl = event.ctrlKey || event.metaKey;
      const SEND_MESSAGE_KEY =
        localStorage.getItem(SEND_MESSAGE_ITEM_NAME) ?? ENTER_KEY_NAME;
      if (
        SEND_MESSAGE_KEY === ENTER_KEY_NAME &&
        event.key === "Enter" &&
        isCtrl
      ) {
        // enter发送消息时 ctrl+enter 触发换行
        editor.insertBreak();
      }
    });
  });
  editor.insertBreak = () => {
    const event = window.event as KeyboardEvent;
    const isCtrl = event.ctrlKey || event.metaKey;
    const SEND_MESSAGE_KEY =
      localStorage.getItem(SEND_MESSAGE_ITEM_NAME) ?? ENTER_KEY_NAME;
    if (
      (SEND_MESSAGE_KEY === ENTER_KEY_NAME && isCtrl) ||
      (SEND_MESSAGE_KEY !== ENTER_KEY_NAME && !isCtrl)
    ) {
      insertBreak();
    }
  };
};
const handleCreated = (editor: IDomEditor) => {
  registerInsertBreak(editor);
  editorRef.value = editor; // 记录 editor 实例，重要
  editorRef.value.focus(true); // 光标定位到输入尾部
};
// 每秒保存一次草稿
const handleEditorContentChange = throttle((editor: IDomEditor) => {
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
    draft: editorRef.value.getText().trim(),
  });
}, 1000);

const handleToolbarClick = () => {
  if (editorRef.value && !editorRef.value.isFocused()) {
    editorRef.value.focus();
  }
};
const handleClickEditor = () => {
  editorRef.value.focus();
};

const sendMessage = () => {
  const html = editorRef.value.getHtml();
  const doc = new DOMParser().parseFromString(html, "text/html");

  // 手动解析内容 否则 @人员 解析不到（空节点）
  const list = doc.querySelectorAll("p");
  const textList: string[] = [];
  list.forEach((item: any) => {
    textList.push(item.textContent || "");
  });
  const text = textList.join("\n").trim();

  if (!text) return;

  const userList: string[] = [];
  if (isGroupConversation.value) {
    // 获取 @ 人员的userId
    const mentionElementList = doc.querySelectorAll(
      'span[data-w-e-type="mention"]'
    );
    mentionElementList.forEach((item: any) => {
      const { userId } = JSON.parse(
        decodeURIComponent(item.getAttribute("data-info"))
      );
      if (userId) {
        userList.push(userId);
      }
    });
  }

  // 构造消息体
  emits("on-send-message", {
    type: messageStore.referenceMessage
      ? MessageContentType.Custom
      : MessageContentType.Text,
    params: {
      text,
      userList,
    },
  });
  editorRef.value.clear();
  messageStore.setReferenceMessage(null);
};
const handleSendMessageKeyup = (key: string) => {
  const SEND_MESSAGE_KEY =
    localStorage.getItem(SEND_MESSAGE_ITEM_NAME) ?? ENTER_KEY_NAME;

  if (SEND_MESSAGE_KEY === key) {
    sendMessage();
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

const isShowMentionModal = ref(false);
const mentionList = ref<MentionUser[]>([]);
if (isGroupConversation.value) {
  // 群聊
  listGroupMemberV2({
    groupId: messageStore.activeRecordItem.conversationId,
    userId: userStore.userId,
    pageNum: 1,
    pageSize: 100000,
  }).then(({ items }: any) => {
    mentionList.value = [
      { name: "所有人", userId: "__kImSDK_MessageAtALL__", avatar: "" },
      ...items.map((item: any) => ({
        userId: item.userId,
        name: item.user?.realName || "",
        avatar: item.user?.avatar || "",
      })),
    ];
  });
}

// 显示弹框
function showMentionModal() {
  isShowMentionModal.value = true;
}
// 隐藏弹框
function hideMentionModal() {
  isShowMentionModal.value = false;
}
// 选择 @ 人员，插入 mention 节点
const insertMention = (user: MentionUser) => {
  const mentionNode: MentionElement = {
    type: "mention", // 必须是 'mention'
    value: `${user.name} `, // 文本
    info: { userId: user.userId }, // 其他信息，自定义
    children: [{ text: "" }], // 必须有一个空 text 作为 children
  };

  editorRef.value.restoreSelection(); // 恢复选区
  editorRef.value.deleteBackward("character"); // 删除 '@'
  editorRef.value.insertNode(mentionNode); // 插入 mention
  editorRef.value.move(1); // 移动光标
};

// 复制 剪切 粘贴
const messageInputRef = ref();
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

  // 注册快捷键截图事件监听
  window.ipcRenderer.on(QUICK_SCREENSHOTS, () => {
    // 找到截图按钮
    const screenshotsButton: HTMLElement | null = document.querySelector(
      'button[data-tooltip="截图"]'
    );
    if (screenshotsButton) {
      screenshotsButton.click();
    }
  });
});
onBeforeUnmount(() => {
  if (messageInputWrapperRef.value) {
    messageInputWrapperRef.value.removeEventListener(
      "contextmenu",
      handleSelectText
    );
  }

  // 卸载快捷键截图事件监听
  window.ipcRenderer.removeAllListeners(QUICK_SCREENSHOTS);
});
const handleCopy = () => {
  navigator.clipboard.writeText(selectionText);
};
const handleShear = () => {
  navigator.clipboard.writeText(selectionText);
  if (editorRef.value) {
    editorRef.value.focus();
    editorRef.value.deleteFragment();
  }
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
          if (editorRef.value) {
            editorRef.value.focus();
            editorRef.value.insertText(text);
          }
        });
      }
    });
};
</script>

<style lang="less" scoped>
.toolbar {
  :deep(.w-e-drop-panel) {
    top: -330px;
    background: #fff;
  }
  :deep(.w-e-bar) {
    background: transparent;
    svg {
      width: 18px;
      height: 18px;
      fill: #999;
    }
  }
  :deep(.w-e-bar-item) {
    height: 30px;
    padding: 4px 0;
  }
  .icon {
    @apply w-6 p-1 mr-2 cursor-pointer rounded-md absolute;
    &:hover {
      background: #e3e3e3;
    }
  }
}
.editor {
  :deep(.w-e-text-container p) {
    margin: 0;
  }
  :deep(.w-e-text-container) {
    background: transparent;
    p {
      line-height: 2;
    }
  }
}
</style>
