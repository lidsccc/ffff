<template>
  <div
    v-if="!!messageContent"
    class="text-center text-xs text-gray-400 py-[16px] select-none"
  >
    {{ messageContent }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "GroupNotifyMessage",
});
</script>

<script lang="ts" setup>
import { watchEffect, ref } from "vue";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { Message, GroupNoticeMode } from "@/types/message";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  detail: Message;
}

const props = defineProps<Props>();

const messageContent = ref("");
watchEffect(async () => {
  try {
    const { mode, from, to = [], content } = JSON.parse(props.detail.content);

    const { name: fromName } = await messageStore.getNameAndAvatar(from);
    const toNameList = [];
    for (let i = 0; i < (to || []).length; i++) {
      const { name } = await messageStore.getNameAndAvatar(to[i]);
      toNameList.push(name);
    }

    switch (mode) {
      case GroupNoticeMode.GROUP_DISBANDED: //解散群ok
      case GroupNoticeMode.MEMBER_JOINED: //加入群ok
      case GroupNoticeMode.GROUP_ANNOUNCED: //群公告 不ok
      case GroupNoticeMode.MAINTAINER_REMOVED: //移除管理员 不OK
      case GroupNoticeMode.GROUP_NAME_CHANGED: //修改群名称 不ok
        break;
      case GroupNoticeMode.MEMBER_KICKED_OFF: //踢人ok
        messageContent.value = `${toNameList.join("、")}${content}`;
        break;
      case GroupNoticeMode.MEMBER_INVITED: //邀请进群ok,from错误
        messageContent.value = `${
          from === userStore.userId ? "你" : fromName || from
        }邀请${toNameList.join("、")}${content}`;
        break;
      case GroupNoticeMode.LEADER_CHANGED: //转让群主ok
        messageContent.value = `${to}${content}`;
        break;
      case GroupNoticeMode.MEMBER_LEFT: //退群ok
      case GroupNoticeMode.MAINTAINER_CHANGED: //更改管理员 不ok
        messageContent.value = `${fromName}${content}`;
        break;
      default:
    }
  } catch (err: any) {
    window.$log.error("GroupNotifyMessage", err);
  }
});
</script>

<style lang="less" scoped></style>
