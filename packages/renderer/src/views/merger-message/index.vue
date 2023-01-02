<template>
  <div>
    <div v-if="isWindows" class="flex justify-between mb-8">
      <div class="text-gray-400 flex-1 pl-2 title">{{ title }}</div>
      <WindowSize />
    </div>
    <div v-else class="text-gray-400 title text-center pt-2 mb-8">
      {{ title }}
    </div>
    <div class="list px-8">
      <MessageList :list="mergerMessageList" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import WindowSize from "@/layout/WindowSize.vue";
import { MERGER_MESSAGE_DATA } from "@/../../main/channel";
import MessageList from "@/components/MessageList/index.vue";
import { isString } from "lodash-es";

const isWindows = computed(() => window["$platform"] === "win32");

const title = ref("");
const mergerMessageList = ref([]);

window.ipcRenderer.on(MERGER_MESSAGE_DATA, (_event, data) => {
  const obj = JSON.parse(data);
  title.value = obj.title;
  mergerMessageList.value = obj.mergerMessageList.map((item: any) => {
    if (!isString(item.content)) {
      item.content = JSON.stringify(item.content);
    }
    return item;
  });
});
</script>

<style lang="less" scoped>
.title {
  -webkit-app-region: drag;
}
.list {
  height: calc(100vh - 90px);
  overflow-y: auto;
}
</style>
