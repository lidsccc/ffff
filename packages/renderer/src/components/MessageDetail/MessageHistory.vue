<template>
  <div
    class="cursor-pointer font-medium flex items-center select-none"
    @click="openDialog"
  >
    <div class="text-gray px-2 py-1 rounded-xl hover:bg-gray-300">聊天记录</div>
  </div>
  <el-dialog
    customClass="message-history-dialog"
    width="65%"
    top="5vh"
    v-model="dialogVisible"
    :title="title"
  >
    <div class="mb-2">
      <el-input
        v-model="input"
        placeholder="请输入搜索内容"
        :prefix-icon="Search"
      />
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="全部" name="all">
        <MessageHistoryList v-if="activeName === 'all'" :searchValue="input" />
      </el-tab-pane>
      <el-tab-pane label="图片与视频" name="media">
        <MessageHistoryList
          v-if="activeName === 'media'"
          :msgType="[MessageContentType.Image, MessageContentType.Video]"
          :searchValue="input"
        />
      </el-tab-pane>
      <el-tab-pane label="文件" name="file">
        <MessageHistoryList
          v-if="activeName === 'file'"
          :msgType="[MessageContentType.File]"
          :searchValue="input"
        />
      </el-tab-pane>
      <el-tab-pane label="链接" name="link">
        <MessageHistoryList
          v-if="activeName === 'link'"
          :msgType="[MessageContentType.Article]"
          :searchValue="input"
        />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageHistory",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { Search } from "@element-plus/icons-vue";
import { MessageContentType } from "@/types/message";
import { useMessageStore } from "@/store/modules/message";
import MessageHistoryList from "./MessageHistoryList.vue";

const messageStore = useMessageStore();

const dialogVisible = ref(false);
const openDialog = () => {
  dialogVisible.value = true;
};

const input = ref("");

const title = computed(() => {
  const name = messageStore.activeRecordItem.conversationName || "";
  const MAX_NAME_LEN = 25;
  return `${name.slice(0, MAX_NAME_LEN)}${
    name.length > MAX_NAME_LEN ? "..." : ""
  }的聊天记录`;
});

const activeName = ref("all");
const handleClick = (tab: string) => {
  activeName.value = tab.paneName;
};
</script>

<style lang="less">
.message-history-dialog {
  background: #f1f2f3;
  & > .el-dialog__header {
    padding: 12px 24px 0 24px;
  }
  & > .el-dialog__body {
    padding: 12px 24px;
  }
}
</style>
<style lang="less" scoped>
.text-gray {
  color: var(--theme-text-gray);
}
</style>
