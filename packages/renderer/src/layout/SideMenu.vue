<template>
  <div class="h-full py-6 flex flex-col justify-between">
    <div class="w-full flex flex-col items-center avatar-wrapper">
      <UserAvatar
        :size="40"
        :src="getCacheAvator(userStore.avatar)"
        :name="userStore.firstName"
        :id="userStore.userId"
        class="cursor-pointer avatar"
        @click="openUserDetailDialog"
      />
    </div>
    <el-menu
      :default-active="currentIndex"
      router
      @select="selectMenu"
      class="side-menu"
    >
      <el-menu-item v-for="item in routes" :index="item.path" :key="item.name">
        <div class="w-full mb-8 flex flex-col items-center select-none">
          <el-badge
            :value="getBadgeValue(item.path)"
            :hidden="!getBadgeVisible(item.path)"
            class="badge"
          >
            <img
              :src="
                currentIndex === item.path
                  ? item.meta.activeIcon
                  : item.meta.icon
              "
              class="menu-icon"
            />
          </el-badge>
          <div
            :class="
              currentIndex === item.path ? 'menu-title active' : 'menu-title'
            "
          >
            {{ item.meta.title }}
          </div>
        </div>
      </el-menu-item>
    </el-menu>
    <div class="w-full flex flex-col items-center cursor-pointer">
      <SideSetting />
    </div>
  </div>
  <el-dialog
    v-model="isUserDetailShow"
    width="450px"
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="true"
  >
    <UserDetail :canEdit="true" />
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SideMenu",
});
</script>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { routes } from "@/router";
import UserDetail from "@/components/UserDetail/index.vue";
import SideSetting from "./SideSetting.vue";
import { useMessageStore } from "@/store/modules/message";
import { useUserStore } from "@/store/modules/user";
import { getCacheAvator } from "@/utils/avatar";
import { useGlobalStore } from "@/store/modules/global";
import UserAvatar from "@/components/UserAvatar/index.vue";

const route = useRoute();
const globalStore = useGlobalStore();

const messageStore = useMessageStore();
const userStore = useUserStore();

const isUserDetailShow = ref(false);
const openUserDetailDialog = () => {
  isUserDetailShow.value = true;
};

const totalUnreadMsgCount = computed(() => {
  let total = 0;
  messageStore.conversationList
    .filter((conv: any) => conv.conversationId !== "ROBOT_PIN")
    .forEach((conv: any) => {
      if (!conv.noInform) {
        total += conv.numOfNotReadMsg || 0;
      }
    });
  return total;
});

const currentIndex = ref("/messages");
const selectMenu = (index) => {
  currentIndex.value = index;
};

watch(
  () => route.path,
  () => {
    const idx = route.path.startsWith("/") ? "1" : "0";
    currentIndex.value = "/" + route.path.split("/")[idx];
  }
);
// 未读消息及未回执pin小红点
const showBadgePathList = ["/pin", "/messages"];
const getBadgeVisible = (path: string) => {
  // 是否显示小红点
  const badgeVisible: Record<string, boolean> = {
    ["/messages"]: totalUnreadMsgCount.value ? true : false,
    ["/pin"]: globalStore.pinBadge ? true : false,
  };
  return showBadgePathList.includes(path) ? badgeVisible[path] : false;
};
const getBadgeValue = (path: string) => {
  // 小红点显示的数值
  const badgeValue: Record<string, number> = {
    "/pin": globalStore.pinBadge,
    "/messages": totalUnreadMsgCount.value,
  };
  return badgeValue[path];
};
onMounted(() => {
  globalStore.updatePinBadge();
});
</script>

<style lang="less" scoped>
.badge {
  :deep(.el-badge__content.is-fixed) {
    right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
}

.avatar-wrapper {
  position: relative;
  top: 40px;
  .avatar {
    border: 1px solid #fff;
  }
}

.side-menu {
  border: none;
  --el-menu-bg-color: transparent !important;
  --el-menu-hover-bg-color: transparent !important;
  --el-menu-item-height: 71px;
}

.menu-icon {
  width: 24px;
  height: 24px;
}

.menu-title {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  line-height: 12px;
  &.active {
    color: var(--theme-color);
  }
}
</style>
