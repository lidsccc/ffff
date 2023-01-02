<template>
  <div
    class="flex -mt-2 mb-2 text-gray-400"
    :class="{
      'flex-row-reverse': !fromOther,
      'mr-16': !fromOther,
      'ml-16': fromOther,
    }"
  >
    <div class="quoted-message">
      {{ `${quotedMessageContent.name}：${quotedMessageContent.text}` }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "QuotedMessage",
});
</script>

<script lang="ts" setup>
import { computed, reactive, watchEffect } from "vue";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { Message } from "@/types/message";
import { getQuotedMessageContent, getMessagePreview } from "@/utils/message";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  detail: Message;
}

const props = defineProps<Props>();

const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});
const quotedMessageContent = reactive({
  name: "",
  text: "",
});

watchEffect(async () => {
  const { quotedMsg = {} } = getQuotedMessageContent(props.detail);
  const { name } = await messageStore.getNameAndAvatar(quotedMsg.from);
  const text = getMessagePreview(quotedMsg);
  quotedMessageContent.name = name;
  quotedMessageContent.text = text;
});
</script>

<style lang="less" scoped>
.quoted-message {
  max-width: 80%;
  display: inline-block;
  display: inline-flex;
  font-size: 12px;
  color: #515a6e;
  line-height: 18px;
  padding: 6px 8px;
  border-radius: 2px;
  background: #e5e7eb;
}
</style>
