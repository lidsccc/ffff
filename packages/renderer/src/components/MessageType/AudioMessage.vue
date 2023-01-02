<template>
  <div
    :class="
      !props.showBubble
        ? 'normal-container'
        : fromOther
        ? 'bubble bubble-left bg-white'
        : 'bubble bubble-right bg-primary'
    "
  >
    <div
      class="flex items-center justify-between w-[80px] cursor-pointer select-none"
      :class="fromOther ? 'flex-row-reverse' : ''"
      :style="{ width: `${80 + Math.min(duration, 60) * 3}px` }"
      @click="play"
    >
      <div class="flex-1 text-center">{{ duration }}''</div>
      <div
        class="wifi-symbol"
        :class="
          fromOther || !props.showBubble
            ? 'wifi-symbol-other'
            : 'wifi-symbol-self'
        "
      >
        <div class="wifi-circle first"></div>
        <div
          class="wifi-circle second"
          :class="isPlaying ? 'second-animation' : ''"
        ></div>
        <div
          class="wifi-circle third"
          :class="isPlaying ? 'third-animation' : ''"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AudioMessage",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/store/modules/user";
import { Message } from "@/types/message";
import { Howl } from "howler";
import { PCM2WAV } from "@/../../main/channel";

const userStore = useUserStore();

interface Props {
  detail: Message;
  showBubble?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showBubble: true });

const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});

const audioPath = ref("");
const duration = ref(0);
const isPlaying = ref(false);
const percentage = ref(0);

try {
  const { dur } = JSON.parse(props.detail.content);
  duration.value = Math.round(dur / 1000);
} catch (err: any) {
  window.$log.error("解析音频消息content失败", err);
}

var sound: any;
const play = () => {
  if (isPlaying.value) {
    sound?.stop();
    isPlaying.value = false;
    return;
  }
  isPlaying.value = true;
  sound?.play();
  setTimeout(() => {
    isPlaying.value = false;
  }, duration.value * 1000);
};

const downloadAudio = () => {
  window.$imRender.downloadFile({
    messageId: props.detail.mid,
    isOriginalFile: true,
    callback: async ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        // 下载成功
        percentage.value = 100;
        try {
          const { savedPath } = JSON.parse(jsonParams);
          audioPath.value =
            "local:///" + savedPath.replace(".pcm", "") + ".wav";
          // pcm转wav pcm不能直接播放
          const out = await window.ipcRenderer.invoke(PCM2WAV, savedPath);
          console.log("转码成功", out);
          sound = new Howl({
            src: [audioPath.value],
          });
        } catch (err: any) {
          window.$log.error("下载音频成功结果解析失败", err);
          return;
        }
      } else if (code === 1) {
        // 下载进度不
      } else {
        // 下载失败
        window.$log.error(`下载音频失败：${desc}`);
      }
    },
  });
};

downloadAudio();
</script>

<style lang="less" scoped>
.normal-container {
  display: inline-block;
  padding: 12px;
  background: #fff;
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
}

.bubble-left {
  border-radius: 3px 10px 10px 12px;
}
.bubble-right {
  border-radius: 10px 3px 12px 10px;
}

.bg-primary {
  background: var(--theme-color-light);
}

.wifi-symbol {
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
.wifi-symbol-self {
  transform: rotate(135deg);
}
.wifi-symbol-other {
  transform: rotate(315deg);
}
.wifi-circle {
  border: 1px solid #000;
  border-radius: 50%;
  position: absolute;
}
.first {
  width: 8px;
  height: 8px;
  background: #000;
  top: -4px;
  left: -4px;
}
.second {
  width: 16px;
  height: 16px;
  top: -8px;
  left: -8px;
}
.second-animation {
  animation: fadeInOut 1s infinite 0.2s;
}
.third {
  width: 24px;
  height: 24px;
  top: -12px;
  left: -12px;
}
.third-animation {
  animation: fadeInOut 1s infinite 0.4s;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
