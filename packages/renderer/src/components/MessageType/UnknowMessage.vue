<template>
  <div
    v-if="props.showBubble"
    :class="
      fromOther
        ? 'bubble bubble-left bg-white'
        : 'bubble bubble-right bg-primary'
    "
  >
    [未知消息]
  </div>
  <div v-else>[未知消息]</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UnknowMessage",
});
</script>

<script lang="ts" setup>
import { computed } from "vue";
import { useUserStore } from "@/store/modules/user";
import { Message } from "@/types/message";

const userStore = useUserStore();

interface Props {
  detail: Message;
  showBubble?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showBubble: true });

const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});
</script>

<style lang="less" scoped>
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
</style>
