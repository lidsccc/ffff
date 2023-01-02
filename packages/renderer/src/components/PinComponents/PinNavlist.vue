<template>
  <div class="w-60 h-full bg-white">
    <el-menu
      class="el-menu-vertical-demo"
      active-text-color="#00b0bb"
      default-active="全部"
    >
      <el-menu-item
        v-for="item in NavList"
        :index="item.title"
        :key="item.title"
        @click="hendleSelectTask(item)"
      >
        <div v-if="item.title === PinNavListType.UNFINISHED">
          <el-badge
            :value="globalStore.pinBadge"
            :hidden="globalStore.pinBadge === 0"
            class="unreceiptbadge"
          >
            <div class="flex justify-between w-full">
              <div class="flex items-center">
                <img :src="item.avatar" class="h-5 mr-2" />
                <div>{{ item.title }}</div>
              </div>
            </div>
          </el-badge>
        </div>

        <div class="flex justify-between w-full" v-else>
          <div class="flex items-center">
            <img :src="item.avatar" class="h-5 mr-2" />
            <div>{{ item.title }}</div>
          </div>
        </div>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PinNavlist",
});
</script>

<script lang="ts" setup>
import PinAllIcon from "@/assets/pin-all.png";
import PinUnfinishIcon from "@/assets/pin-unfinish.png";
import PinFinished from "@/assets/pin-finished.png";
import PinSentIcon from "@/assets/pin-sent.png";
import { PinType, PinNavListType } from "@/enums/pin";
import { reactive } from "vue";
import { useGlobalStore } from "@/store/modules/global";
export interface PinNavListItem {
  avatar: string;
  title: PinNavListType;
  status: PinType;
}
const globalStore = useGlobalStore();

// 侧边导航栏
const NavList = reactive<PinNavListItem[]>([
  {
    avatar: PinAllIcon,
    title: PinNavListType.ALL,
    status: PinType.ALL,
  },
  {
    avatar: PinUnfinishIcon,
    title: PinNavListType.UNFINISHED,
    status: PinType.UNREPEAT,
  },
  {
    avatar: PinFinished,
    title: PinNavListType.FINISHED,
    status: PinType.REPEATED,
  },
  {
    avatar: PinSentIcon,
    title: PinNavListType.SENT,
    status: PinType.SENT,
  },
]);
const emits = defineEmits(["receive-pin-list", "handle-pin-type"]);
const hendleSelectTask = (item: any) => {
  emits("handle-pin-type", item.status);
};
// 默认加载全部
</script>

<style lang="less" scoped>
.message-record {
  width: 320px;
}
.el-menu {
  --el-menu-item-height: 40px;
  border: none;
  width: 95%;
}
.el-menu-item:hover {
  background-color: rgb(245, 245, 245);
  border-radius: 4px;
}
.el-menu-item {
  padding: 0 0 0 10px !important;
  box-sizing: border-box;
  margin-left: 10px;
}
.unreceiptbadge {
  :deep(.el-badge__content.is-fixed) {
    right: -110px;
    top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
}
</style>
