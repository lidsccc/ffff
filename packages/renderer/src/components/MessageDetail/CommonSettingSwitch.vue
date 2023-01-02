<template>
  <div class="select-none">
    <div v-if="!props.isGroup" class="setting-switch mb-4">
      <div>设为常用联系人</div>
      <el-switch v-model="setting.isTopContact" @change="setTopContact" />
    </div>
    <div class="setting-switch mb-4">
      <div>消息免打扰</div>
      <el-switch
        :modelValue="messageStore.activeRecordItem.noInform"
        @change="handleDisturb"
      />
    </div>
    <div class="setting-switch">
      <div>置顶聊天</div>
      <el-switch
        :modelValue="!!messageStore.activeRecordItem.onTop"
        @change="handleTop"
      />
    </div>
    <div class="flex items-center justify-center mt-4">
      <el-button type="danger" @click="handleClearMessage"
        >清空聊天记录</el-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CommonSettingSwitch",
});
</script>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useUserStore } from "@/store/modules/user";
import {
  checkTopContact,
  addTopContact,
  deleteTopContact,
} from "@/api/contacts";
import { ElMessage } from "element-plus";
import { useMessageStore } from "@/store/modules/message";

const props = defineProps<{ isGroup: boolean }>();

const userStore = useUserStore();
const messageStore = useMessageStore();

const setting = reactive({
  isTopContact: false,
});
const fetchIsTopContact = () => {
  checkTopContact({
    userId: userStore.userId,
    contactId: messageStore.activeRecordItem.conversationId,
  }).then((data) => {
    setting.isTopContact = !!data;
  });
};
if (!props.isGroup) {
  fetchIsTopContact();
}
watch(
  () => messageStore.activeRecordItem.conversationId,
  () => {
    if (!props.isGroup) {
      fetchIsTopContact();
    }
  }
);
const setTopContact = () => {
  if (!setting.isTopContact) {
    // 删除常用联系人
    deleteTopContact({
      userId: userStore.userId,
      contact: [
        { code: messageStore.activeRecordItem.conversationId, isGroup: 0 },
      ],
    }).then(() => {
      fetchIsTopContact();
      ElMessage.success({ message: "修改成功" });
    });
  } else {
    // todo
    // 添加常用联系人
    addTopContact({
      userId: userStore.userId,
      contact: [
        { code: messageStore.activeRecordItem.conversationId, isGroup: 0 },
      ],
    }).then(() => {
      fetchIsTopContact();
      ElMessage.success({ message: "修改成功" });
    });
  }
};
const handleClearMessage = () => {
  const chatId = messageStore.activeRecordItem.conversationId;
  window.$imRender
    .delMsgByChatID(chatId)
    .then(({ data }: any) => {
      if (data) {
        messageStore.clearMessageContent(chatId);
        ElMessage.success({ message: "已清空" });
      } else {
        window.$log.error("clear message failed: ", data);
        ElMessage.error({ message: "清空失败" });
      }
    })
    .catch((err: any) => {
      window.$log.error("clear message error: ", err);
    });
};

// 置顶
const handleTop = (isPinned: boolean) => {
  const {
    conversationId,
    conversationType,
    conversationName,
    conversationAvatar,
  } = messageStore.activeRecordItem;
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
  } = messageStore.activeRecordItem;
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
</script>

<style scoped>
.setting-switch {
  @apply flex justify-between items-center;
}
</style>
