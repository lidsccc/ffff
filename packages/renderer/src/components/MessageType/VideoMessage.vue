<template>
  <div
    :class="
      !props.showBubble
        ? 'container'
        : fromOther
        ? 'bubble bubble-left'
        : 'bubble bubble-right'
    "
  >
    <el-image
      style="min-width: 100px; max-width: 250px; height: 250px"
      :src="posterPath"
      fit="contain"
    />
    <template
      v-if="!(props.detail.mid in messageStore.messageTransmissionPercentage)"
    >
      <div
        class="absolute right-[4px] bottom-[2px] text-base text-white font-medium"
      >
        {{ videoDuration }}
      </div>
      <el-icon @click="showVideoPlay" class="play-wrapper"
        ><VideoPlay
      /></el-icon>
    </template>
  </div>
  <MessageProgress :mid="props.detail.mid" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VideoMessage",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { Message } from "@/types/message";
import { useUserStore } from "@/store/modules/user";
import { SHOW_VIDEO_PLAY } from "@/../../main/channel";
import { getTime } from "@/utils/time";
import { useMessageStore } from "@/store/modules/message";
import MessageProgress from "@/components/MessageProgress/index.vue";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  detail: Message;
  showBubble?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showBubble: true });

console.log("video-message", props.detail);

const posterPath = ref("");
const videoPath = ref("");

const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});

const videoDuration = computed(() => {
  try {
    const { dur } = JSON.parse(props.detail.content);
    return getTime(Math.round(dur / 1000));
  } catch (err: any) {
    window.$log.error("视频消息content解析异常", err, props.detail);
    return 0;
  }
});

const downloadPoster = () => {
  window.$imRender.downloadFile({
    messageId: props.detail.mid,
    isOriginalFile: false,
    callback: ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        // 下载成功
        try {
          const { savedPath } = JSON.parse(jsonParams);
          posterPath.value = `local:///${savedPath}`;
        } catch (err: any) {
          window.$log.error("下载视频封面成功结果解析失败", err);
          return;
        }
      } else if (code === 1) {
        // 下载进度不做处理
      } else {
        // 下载失败
        window.$log.error(`下载视频封面失败：${desc}`);
      }
    },
  });
};

const downloadVideo = () => {
  window.$imRender.downloadFile({
    messageId: props.detail.mid,
    isOriginalFile: true,
    callback: ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        // 下载成功
        messageStore.updateMessageTransmissionPercentage(props.detail.mid, 100);
        try {
          const { savedPath } = JSON.parse(jsonParams);
          videoPath.value = `local:///${savedPath}`;
        } catch (err: any) {
          window.$log.error("下载视频成功结果解析失败", err);
          return;
        }
      } else if (code === 1) {
        // 下载进度不
        messageStore.updateMessageTransmissionPercentage(
          props.detail.mid,
          Math.floor(desc * 100)
        );
      } else {
        // 下载失败
        window.$log.error("下载视频失败：", [code, desc, jsonParams]);
      }
    },
  });
};

downloadPoster();
downloadVideo();

const showVideoPlay = () => {
  window.ipcRenderer.invoke(SHOW_VIDEO_PLAY, videoPath.value);
};
</script>

<style lang="less" scoped>
.container {
  max-width: 250px;
  height: 250px;
  width: auto;
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bubble {
  max-width: 250px;
  height: 250px;
  position: relative;
  font-size: 0;
  overflow: hidden;
}

.bubble-left {
  border-radius: 3px 10px 10px 12px;
}
.bubble-right {
  border-radius: 10px 3px 12px 10px;
}

.progress {
  position: absolute;
  left: calc(50% - 10px);
  top: calc(50% - 10px);
}

.play-wrapper {
  position: absolute;
  left: calc(50% - 20px);
  top: calc(50% - 20px);
  font-size: 40px;
  color: #fff;
}

/* 全屏按钮 */
video::-webkit-media-controls-fullscreen-button {
  display: none;
}
/* 播放按钮 */
// video::-webkit-media-controls-play-button {
//     display: none;
// }
/* 进度条 */
video::-webkit-media-controls-timeline {
  display: none;
}
/* 观看的当前时间 */
video::-webkit-media-controls-current-time-display {
  display: none;
}
/* 剩余时间 */
video::-webkit-media-controls-time-remaining-display {
  display: none;
}
/* 音量按钮 */
video::-webkit-media-controls-mute-button {
  display: none;
}
video::-webkit-media-controls-toggle-closed-captions-button {
  display: none;
}
/* 音量的控制条 */
video::-webkit-media-controls-volume-slider {
  display: none;
}
/* 所有控件 */
// video::-webkit-media-controls-enclosure {
//   display: none;
// }
</style>
