<template>
  <!-- 已经做了xss过滤 -->
  <div
    class="bubble whitespace-pre-wrap break-all"
    :class="
      !props.showBubble
        ? 'max-w-[80%]'
        : fromOther
        ? 'bubble-left bg-white'
        : 'bubble-right bg-primary'
    "
    v-html="messageContent"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextMessage",
});
</script>

<script lang="ts" setup>
import { computed } from "vue";
import { useUserStore } from "@/store/modules/user";
import { Message } from "@/types/message";
import { urlToLink } from "@/utils/href";
import { isQuotedMessage, getQuotedMessageContent } from "@/utils/message";

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
  if (isQuotedMessage(props.detail)) {
    return urlToLink(getQuotedMessageContent(props.detail).text);
  }
  try {
    const content = JSON.parse(props.detail.content);
    return urlToLink(content.text);
  } catch {
    return "";
  }
});
</script>

<style lang="less" scoped>
.bubble {
  min-height: 44px;
  display: inline-block;
  font-size: 14px;
  line-height: 20px;
  color: #000;
  padding: 12px 12px;
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
</style>
