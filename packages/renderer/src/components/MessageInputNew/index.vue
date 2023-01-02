<template>
  <div class="h-40 select-none">
    <SelectOperation
      v-if="props.status === MessageOperationStatus.Select"
      @on-forward-message="onForwardMessage"
      @on-change-status="onChangeStatus"
    />
    <div
      v-else
      @dragleave="preventDefault"
      @dragover="preventDefault"
      @dragenter="preventDefault"
      @drop="handleDragFileSend"
    >
      <InputOperation @on-send-message="onSendMessage" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageInputNew",
});
</script>

<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { MessageContentType, MessageOperationStatus } from "@/types/message";
import { isImg, isVideo, isAudio } from "@/utils/img";
import { getVideoPreviewInfo } from "@/utils/videoHelper";
import { WRITE_FILE } from "@/../../main/channel";
import SelectOperation from "./SelectOperation.vue";
import InputOperation from "./InputOperation.vue";

const MAX_SEND_FILE_NUM = 9; // 一次最多拖动9个文件发送

interface Props {
  status: MessageOperationStatus;
}

const props = defineProps<Props>();
const emits = defineEmits([
  "on-change-status",
  "on-send-message",
  "on-forward-message",
]);

const onForwardMessage = (param: any) => {
  emits("on-forward-message", param);
};
const onSendMessage = (param: any) => {
  emits("on-send-message", param);
};
const onChangeStatus = (param: any) => {
  emits("on-change-status", param);
};

const preventDefault = (e: any) => {
  e.preventDefault();
  return false;
};
const handleDragFileSend = (e: any) => {
  const fileList = e.dataTransfer.files || [];
  if (fileList.length > MAX_SEND_FILE_NUM) {
    ElMessage.warning({
      message: `每次最多只能发送${MAX_SEND_FILE_NUM}个文件`,
    });
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
</script>

<style lang="less" scoped></style>
