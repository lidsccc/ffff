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
    @click="handleOpenMap"
  >
    <div
      :class="
        props.showBubble ? '' : 'bg-white overflow-hidden rounded w-[240px]'
      "
    >
      <div class="px-[12px] py-[8px]">
        <div class="font-medium truncate">
          {{ messageContent.description }}
        </div>
        <div class="text-gray-400 text-xs truncate">
          {{ messageContent.address }}
        </div>
      </div>
      <img :src="LocationImg" />
      <!-- <div>
        经度{{ messageContent.longitude }} 纬度{{ messageContent.latitude }}
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LocationMessage",
});
</script>

<script lang="ts" setup>
import { computed } from "vue";
import { useUserStore } from "@/store/modules/user";
import { Message } from "@/types/message";
import LocationImg from "@/assets/location.png";
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
    const { name, latitude, longitude } = JSON.parse(props.detail.content);
    const { description, address } = JSON.parse(name);
    return { description, address, latitude, longitude };
  } catch {
    return {};
  }
});

const handleOpenMap = () => {
  const url = `https://www.amap.com/search?query=${messageContent.value.description}`;
  window.ipcRenderer.send(OPEN_WEBSITE, url);
};
</script>

<style lang="less" scoped>
.bubble {
  width: 240px;
  display: inline-block;
  font-size: 14px;
  line-height: 20px;
  color: #000;
  border-radius: 3px 10px 10px 12px;
  background: #fff;
  overflow: hidden;
}

.bubble-left {
  border-radius: 3px 10px 10px 12px;
}
.bubble-right {
  border-radius: 10px 3px 12px 10px;
}
</style>
