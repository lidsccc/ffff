<template>
  <div
    :class="
      !props.showBubble
        ? 'normal-container'
        : fromOther
        ? 'bubble bubble-left bg-white'
        : 'bubble bubble-right bg-white'
    "
    @click="openLink"
  >
    <div class="text-base font-medium article-name">
      {{ messageContent.name }}
    </div>
    <div class="flex items-center justify-between pt-1 pb-2 border-b">
      <div class="text-xs article-link">{{ messageContent.url }}</div>
      <img class="w-[48px] h-[48px] ml-2" src="@/assets/main-icon.png" />
    </div>
    <div class="flex items-center pt-2">
      <img
        class="w-[16px] h-[16px] rounded-[50%]"
        src="@/assets/main-icon.png"
      />
      <div class="ml-1 text-xs text-gray-500">未知来源</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextMessage",
});
</script>

<script lang="ts" setup>
import { computed } from "vue";
import { Message } from "@/types/message";
import { useUserStore } from "@/store/modules/user";
import { OPEN_WEBSITE } from "@/../../main/channel";

const userStore = useUserStore();

interface Props {
  detail: Message;
  showBubble?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showBubble: true });

const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});

const messageContent = computed(() => {
  try {
    return JSON.parse(props.detail.content);
  } catch {
    return {};
  }
});

const openLink = () => {
  const { url } = messageContent.value;
  if (url) {
    window.ipcRenderer.send(OPEN_WEBSITE, url);
  }
};
</script>

<style lang="less" scoped>
.normal-container {
  width: 320px;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
}
.bubble {
  min-height: 44px;
  width: 320px;
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

.article-name {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}

.article-link {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  word-break: break-all;
}
</style>
