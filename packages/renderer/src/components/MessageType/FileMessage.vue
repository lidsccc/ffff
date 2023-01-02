<template>
  <div
    class="flex items-center"
    :class="fromOther || !props.showBubble ? '' : 'flex-row-reverse'"
  >
    <div>
      <div
        :class="
          !props.showBubble
            ? 'normal-container'
            : fromOther
            ? 'bubble bubble-left'
            : 'bubble bubble-right'
        "
      >
        <div class="flex justify-between w-[240px]">
          <div class="pr-2">
            <div class="file-name">{{ file.name }}</div>
            <div class="text-gray-400 text-xs mt-1">
              {{ file.size }}
            </div>
          </div>
          <img
            :src="fileTypeIconMap[matchType(file.name)]"
            alt=""
            class="h-12"
          />
        </div>
      </div>
      <MessageProgress :mid="props.detail.mid" />
    </div>
    <div
      class="w-[20px] h-[20px] m-2 bg-gray-400 rounded-[50%] text-white flex items-center justify-center cursor-pointer text-xs"
    >
      <el-icon v-if="!filePath" @click="handleDownload"><Download /></el-icon>
      <el-icon v-else @click="handleOpen"><FolderOpened /></el-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FileMessage",
});
</script>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useUserStore } from "@/store/modules/user";
import { Message } from "@/types/message";
import { matchType } from "@/components/TaskComponents/util";
import { fileTypeIconMap } from "@/constant/common";
import { SHOW_ITEM_IN_FOLDER } from "@/../../main/channel";
import { useMessageStore } from "@/store/modules/message";
import MessageProgress from "@/components/MessageProgress/index.vue";

const messageStore = useMessageStore();
const userStore = useUserStore();
interface Props {
  detail: Message;
  showBubble?: boolean;
}
const props = withDefaults(defineProps<Props>(), { showBubble: true });
const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});
const file = computed(() => {
  try {
    const { name = "", size = 0 } = JSON.parse(props.detail.content);
    let formatSize = size;
    const unit = ["B", "KB", "MB", "GB"];
    let unitIdx = 0;
    while (unitIdx < unit.length - 1 && formatSize > 1024) {
      formatSize = formatSize / 1024;
      unitIdx += 1;
    }
    const sizeNum = parseFloat(formatSize.toFixed(1));
    const file = {
      name,
      sizeNum,
      size: `${sizeNum}${unit[unitIdx]}`,
    };
    return file;
  } catch (err) {
    window.$log.error("文件信息解析异常", err);
  }
  return {
    name: "",
    size: "",
  };
});

let path: string;
try {
  path = JSON.parse(props.detail.content).path;
} catch {
  path = "";
}
const filePath = ref(path);
const handleDownload = () => {
  window.$imRender.downloadFile({
    messageId: props.detail.mid,
    isOriginalFile: true,
    callback: ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        // 下载成功
        messageStore.updateMessageTransmissionPercentage(props.detail.mid, 100);
        try {
          const { savedPath } = JSON.parse(jsonParams);
          filePath.value = savedPath;
        } catch (err: any) {
          window.$log.error("下载文件成功结果解析失败", err);
          return;
        }
      } else if (code === 1) {
        // 下载中
        messageStore.updateMessageTransmissionPercentage(
          props.detail.mid,
          Math.floor(desc * 100)
        );
      } else {
        // 下载失败
        window.$log.error(`下载文件失败：${desc}`);
      }
    },
  });
};
const handleOpen = () => {
  console.log("filePath:", filePath.value);
  window.ipcRenderer.send(SHOW_ITEM_IN_FOLDER, filePath.value);
};
</script>

<style lang="less" scoped>
.normal-container {
  display: inline-block;
  padding: 12px;
  background: #fff;
  user-select: none;
}
.bubble {
  // max-width: 60%;
  display: inline-block;
  font-size: 14px;
  line-height: 20px;
  color: #000;
  padding: 12px 12px;
  border-radius: 3px 10px 10px 12px;
  background: #fff;
  user-select: none;
}

.bubble-left {
  border-radius: 3px 10px 10px 12px;
}
.bubble-right {
  border-radius: 10px 3px 12px 10px;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}
</style>
