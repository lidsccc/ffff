<template>
  <RouterView />
  <AudioAndVideoCallRequestDialog />
</template>

<script setup lang="ts">
import AudioAndVideoCallRequestDialog from "@/components/AudioAndVideoCallRequestDialog/index.vue";
import { onMounted, onUnmounted } from "vue";
import { useGlobalStore } from "@/store/modules/global";

const globalStore = useGlobalStore();

const setNetworkOnline = () => {
  globalStore.setIsNetworkOffline(false);
};
const setNetworkOffline = () => {
  globalStore.setIsNetworkOffline(true);
};
onMounted(() => {
  window.addEventListener("online", setNetworkOnline);
  window.addEventListener("offline", setNetworkOffline);
});
onUnmounted(() => {
  window.removeEventListener("online", setNetworkOnline);
  window.removeEventListener("offline", setNetworkOffline);
});
</script>

<style>
:root {
  /* --layout-header-height: 52px; */
  --layout-header-height: 0px;
  --layout-aside-width: 64px;
  --content-header-height: 60px;
  --layout-window-size-height: 20px;
  --theme-color: #00b0bb;
  --theme-color-light: rgba(0, 176, 187, 0.4);
  --theme-text-gray: #787878;
  --el-color-primary: #00b0bb !important;
}
/* el-dialog内边距,包括header,body,footer */
.el-dialog {
  --el-dialog-padding-primary: 10px;
}
/* el-dialog的关闭按钮位置 */
.el-dialog__headerbtn {
  top: 0;
}
/* el-dialog的header下内边距 */
.el-dialog__header {
  padding-bottom: 0;
}
/* el-dialog的footer上内边距 */
.el-dialog__footer {
  padding-top: 0;
}
.el-button--primary {
  --el-button-hover-bg-color: rgba(0, 176, 187, 0.4);
  --el-button-hover-border-color: rgba(0, 176, 187, 0.4);
  --el-button-disabled-bg-color: rgba(0, 176, 187, 0.4);
  --el-button-disabled-border-color: rgba(0, 176, 187, 0.4);
}
.el-button:active {
  --el-button-active-bg-color: rgba(0, 176, 187, 0.4);
  --el-button-active-border-color: rgba(0, 176, 187, 0.4);
}
</style>

<style lang="less">
@import "@/styles/index.less";
</style>
