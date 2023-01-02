<template>
  <div class="flex window-size">
    <div
      v-for="item in windowOperations"
      :key="item.channel"
      @click="handleWindowClick(item.channel)"
      class="w-[30px] cursor-pointer flex justify-center items-center item"
      :class="item.class"
    >
      <img :src="item.src" class="w-[10px]" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "WindowSize",
});
</script>

<script lang="ts" setup>
import { reactive } from "vue";
import minIcon from "@/assets/min_black.png";
import maxIcon from "@/assets/max_black.png";
import closeIcon from "@/assets/close_black.png";

const windowOperations = reactive([
  {
    src: minIcon,
    channel: "window-min",
    class: "icon_min_wrapper",
  },
  {
    src: maxIcon,
    channel: "window-max",
    class: "icon_max_wrapper",
  },
  {
    src: closeIcon,
    channel: "window-close",
    class: "icon_close_wrapper",
  },
]);
const handleWindowClick = (channel: string) => {
  ipcRenderer.send(channel);
};
</script>

<style lang="less" scoped>
.window-size {
  -webkit-user-region: no-drag;
  pointer-events: auto;
  .item {
    height: var(--layout-window-size-height);
    &:hover {
      background: #e5e7eb;
    }
  }
  .icon_close_wrapper {
    &:hover {
      background: #f87171;
    }
  }
}
</style>
