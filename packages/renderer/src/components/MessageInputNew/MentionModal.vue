<template>
  <div
    id="mention-modal"
    :style="{
      position: 'absolute',
      top: position.top,
      left: position.left,
    }"
  >
    <div class="bg-white w-[200px] h-[150px] overflow-y-auto">
      <div
        class="truncate h-[30px] leading-[30px] px-2 hover:bg-gray-200 flex items-center"
        v-for="item in props.mentionList"
        :key="item.userId"
        @click="insertMentionHandler(item)"
      >
        <UserAvatar
          :size="20"
          :src="item.avatar"
          :id="item.userId"
          :name="get(item, 'name[0]')"
        >
          <span>{{ get(item, "name[0]") }}</span>
        </UserAvatar>
        <div class="px-2">{{ item.name }}</div>
        <div v-if="item.userId !== ALL_GROUP_MEMBER_ID">
          {{ item.userId }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { MentionUser } from "./type";

export default defineComponent({
  name: "MentionModal",
});
</script>

<script lang="ts" setup>
import { reactive, onMounted } from "vue";
import { ALL_GROUP_MEMBER_ID } from "@/constant/message";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";

interface Props {
  mentionList: any[];
}
const props = defineProps<Props>();
const emits = defineEmits(["insertMention", "hideMentionModal"]);

const position = reactive({
  top: "",
  left: "",
});

onMounted(async () => {
  // 获取光标位置
  const domSelection = document.getSelection();
  const domRange = domSelection?.getRangeAt(0);
  if (domRange == null) return;
  const rect = domRange.getBoundingClientRect();

  // 定位 modal
  position.top = `${rect.top - 155}px`;
  if (rect.left > 800) {
    // 避免弹窗被遮挡
    position.left = `${rect.left - 270}px`;
  } else {
    position.left = `${rect.left - 70}px`;
  }
});

const insertMentionHandler = (user: MentionUser) => {
  emits("insertMention", user);
  emits("hideMentionModal"); // 隐藏 modal
};
</script>

<style lang="less" scoped></style>
