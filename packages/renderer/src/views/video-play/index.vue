<template>
  <div v-if="isWindows" class="flex justify-between">
    <div></div>
    <WindowSize />
  </div>
  <div class="flex items-center justify-center">
    <video
      style="max-width: 100vw; max-height: 100vh"
      controls
      preload="auto"
      :src="videoPath"
    ></video>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import WindowSize from "@/layout/WindowSize.vue";
import { PLAY_VIDEO_DATA } from "@/../../main/channel";

const isWindows = computed(() => window["$platform"] === "win32");

const videoPath = ref("");
window.ipcRenderer.on(PLAY_VIDEO_DATA, (_event, path) => {
  videoPath.value = path;
});
</script>

<style lang="less" scoped></style>
