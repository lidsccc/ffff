<template>
  <div
    class="mt-[2px] message-progress"
    v-if="props.mid in messageStore.messageTransmissionPercentage"
  >
    <el-progress
      :percentage="messageStore.messageTransmissionPercentage[props.mid]"
      color="#00b0bb"
      :stroke-width="3"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageProgress",
});
</script>
<script lang="ts" setup>
import { useMessageStore } from "@/store/modules/message";

interface Props {
  mid: string;
}
const props = withDefaults(defineProps<Props>(), { mid: "" });
const messageStore = useMessageStore();
</script>

<style lang="less" scoped>
.message-progress {
  :deep(.el-progress__text) {
    font-size: 12px !important;
    min-width: 0 !important;
  }
}
</style>
