<template>
  <div
    @click="showMergerMessage"
    class="cursor-pointer bubble select-none"
    :class="!props.showBubble ? '' : fromOther ? 'bubble-left' : 'bubble-right'"
  >
    <div>{{ messageContent.title }}</div>
    <div class="py-[6px]">
      <div
        v-for="(item, idx) in messageContent.abstractList"
        :key="idx"
        class="truncate text-xs text-gray-400 py-[2px]"
      >
        {{ item }}
      </div>
    </div>
    <div class="pt-[8px] border-t text-gray-300">聊天记录</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MergerMessage",
});
</script>

<script lang="ts" setup>
import { computed } from "vue";
import { isString } from "lodash-es";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { Message } from "@/types/message";
import { SHOW_MERGER_MESSAGE } from "@/../../main/channel";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  detail: Message;
  showBubble?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showBubble: true });

const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});

const messageContent = computed(() => {
  // console.log("MergerMessage", props.detail);
  const {
    title = "",
    abstractList = [],
    mergerMessageList = [],
  } = isString(props.detail.content)
    ? JSON.parse(props.detail.content)
    : props.detail.content;
  return { title, abstractList, mergerMessageList };
});

const showMergerMessage = async () => {
  const { title = "", mergerMessageList = [] } = messageContent.value;
  const list = [];
  for (let i = 0; i < mergerMessageList.length; i++) {
    const { from } = mergerMessageList[i];
    mergerMessageList[i].from = from;
    const { avatar, name } = await messageStore.getNameAndAvatar(
      mergerMessageList[i].from
    );
    mergerMessageList[i].name = name;
    mergerMessageList[i].avatar = avatar;
    list.push(mergerMessageList[i]);
  }
  window.ipcRenderer.invoke(
    SHOW_MERGER_MESSAGE,
    JSON.stringify({ title, mergerMessageList: list })
  );
};
</script>

<style lang="less" scoped>
.bubble {
  width: 240px;
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
</style>
