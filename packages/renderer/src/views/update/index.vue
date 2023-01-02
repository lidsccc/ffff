<template>
  <div class="update-page">
    <div class="text-lg font-medium text-black mt-[260px]">
      发现新版本 v{{ update.version }}
    </div>
    <div
      class="text-gray-500 my-[16px] p-2 box-border h-[200px] w-[85%] overflow-y-auto border rounded leading-[24px]"
    >
      <div v-for="(item, index) in update.changeLogs" :key="index" class="mb-2">
        {{ index + 1 }} . {{ item }}
      </div>
    </div>
    <div class="w-[100%] pl-[32px] pb-[16px]">
      <el-progress
        v-if="update.loading"
        :percentage="update.percent"
        :status="update.status"
      />
    </div>
    <div v-if="!update.loading">
      <el-button @click="handleClose">暂不更新</el-button>
      <el-button type="primary" @click="handleUpdate">立即更新</el-button>
    </div>
    <div v-else>
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";

const update = reactive({
  version: "",
  changeLogs: [],
  time: "",
  percent: 0,
  status: "",
  loading: false,
});
window.ipcRenderer.on("UPDATE_VERSION", (_e, data) => {
  const { version, changeLogs, time } = JSON.parse(data);
  update.version = version;
  update.changeLogs = changeLogs;
  update.time = time;
});
window.ipcRenderer.on("UPDATE_PROGRESS", (_e, data) => {
  window.$log.error("UPDATE_PROGRESS", data);
  update.percent = Math.floor(data.percent * 100);
});
window.ipcRenderer.on("UPDATE_ERROR", () => {
  update.status = "exception";
});
window.ipcRenderer.on("UPDATE_END", () => {
  update.percent = 100;
  update.status = "success";
});
const handleClose = () => {
  window.ipcRenderer.send("CLOSE_UPDATE_WINDOW");
};
const handleUpdate = () => {
  update.loading = true;
  window.ipcRenderer.send("UPDATE_APP");
};
</script>

<style lang="less" scoped>
.update-page {
  height: 100vh;
  background-image: url("../../assets/bg_update.png");
  background-repeat: no-repeat;
  background-position: center -90px;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
