<template>
  <div
    v-if="messageStore.referenceMessage"
    class="flex items-center px-[10px] py-[6px]"
  >
    <div class="quoted-message-container">
      <div class="quoted-message-wrapper">
        {{ referenceMessageContentPreview }}
      </div>
    </div>
    <img
      src="@/assets/close-btn.png"
      class="w-6 h-6 p-1 ml-2 cursor-pointer hover:bg-gray-200"
      @click="deleteReferenceMessage"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ReferenceMessage",
});
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useMessageStore } from "@/store/modules/message";
import { getMessagePreview } from "@/utils/message";

const messageStore = useMessageStore();

const referenceMessageContentPreview = computed(() => {
  return `${messageStore.referenceMessage.name}：${getMessagePreview(
    messageStore.referenceMessage
  )}`;
});

const deleteReferenceMessage = () => {
  messageStore.setReferenceMessage(null);
};
</script>

<style lang="less" scoped>
.quoted-message-container {
  padding: 8px 20px;
  background: #e3e3e3;
  border-radius: 0px 6px 6px 6px;
  .quoted-message-wrapper {
    max-width: 400px;
    font-size: 14px;
    color: #666;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    word-break: break-all;
  }
}
</style>
