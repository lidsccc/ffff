<template>
  <div
    class="select-none"
    :class="
      !props.showBubble
        ? ''
        : fromOther
        ? 'bubble bubble-left'
        : 'bubble bubble-right'
    "
    @click="showCardDetail"
  >
    <div :class="props.showBubble ? '' : 'bg-white w-[240px] p-2 rounded'">
      <div class="flex mb-2">
        <UserAvatar
          :size="40"
          :src="messageContent.iconUrl"
          :name="messageContent.name"
          :id="messageContent.id"
        />
        <div class="ml-4">
          <div>{{ messageContent.name }}</div>
          <div class="text-gray-400">{{ messageContent.id }}</div>
        </div>
      </div>
      <div
        class="border-t-[1px] border-gray-100 text-[12px] text-gray-400 pt-1"
      >
        个人名片
      </div>
    </div>
  </div>
  <el-dialog v-model="isCardDetailShow" width="400px" destroy-on-close>
    <UserDetail :id="messageContent.id" />
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BusinessCardMessage",
});
</script>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useUserStore } from "@/store/modules/user";
import { Message } from "@/types/message";
import UserDetail from "@/components/UserDetail/index.vue";
import UserAvatar from "@/components/UserAvatar/index.vue";

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
    const { data } = JSON.parse(props.detail.content);
    const { organizationMember } = JSON.parse(data);
    return organizationMember;
  } catch {
    return {};
  }
});

const isCardDetailShow = ref(false);
const showCardDetail = () => {
  isCardDetailShow.value = true;
};
</script>

<style lang="less" scoped>
.bubble {
  width: 240px;
  display: inline-block;
  font-size: 14px;
  line-height: 20px;
  color: #000;
  padding: 12px 12px 8px 12px;
  border-radius: 3px 10px 10px 12px;
  background: #fff;
}

.bubble-left {
  border-radius: 3px 10px 10px 12px;
}
.bubble-right {
  border-radius: 10px 3px 12px 10px;
}
</style>
