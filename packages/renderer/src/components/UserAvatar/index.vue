<template>
  <el-avatar
    :size="props.size"
    :shape="props.shape"
    :src="getCacheAvator(props.src)"
    :style="{
      background: avatarBgColor,
    }"
  >
    <slot>
      <span v-if="props.name" class="text-white font-medium select-none">
        {{ props.name[0] }}
      </span>
      <el-icon v-else><User /></el-icon>
    </slot>
  </el-avatar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserAvatar",
});
</script>

<script lang="ts" setup>
import { computed } from "vue";
import { getCacheAvator } from "@/utils/avatar";

interface Props {
  size?: number;
  src?: string;
  name?: string;
  id?: string;
  shape?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  src: "",
  name: "",
  id: "",
});

const AvatarBgColorList = [
  "#9CA3AF",
  "#F87171",
  "#D97706",
  "#047857",
  "#2563EB",
  "#4F46E5",
  "#6D28D9",
  "#BE185D",
  "#FBBF24",
];
const avatarBgColor = computed(
  () => AvatarBgColorList[props.id.length % AvatarBgColorList.length]
);
</script>

<style lang="less" scoped></style>
