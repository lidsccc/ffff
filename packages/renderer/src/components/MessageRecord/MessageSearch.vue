<template>
  <div
    class="message-search h-[var(--content-header-height)] flex-shrink-0 flex items-center justify-center"
  >
    <div><AutoCompleteSearch @on-select="handleSelect" /></div>
    <el-tooltip effect="light" content="创建群组" placement="bottom">
      <img
        src="@/assets/add-icon.png"
        class="w-6 h-6 ml-2 cursor-pointer select-none add-icon"
        @click="handleVisibleChange(true)"
      />
    </el-tooltip>
  </div>
  <CreateGroupDialog
    :visible="dialogVisible"
    :selected="selected"
    @on-change-visible="handleVisibleChange"
    @on-confirm="onConfirm"
    @on-cancel="onCancel"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageSearch",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import AutoCompleteSearch from "@/components/AutoCompleteSearch/index.vue";
import CreateGroupDialog from "@/components/CreateGroupDialog/index.vue";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const router = useRouter();

const dialogVisible = ref(false);
const handleVisibleChange = (visible: boolean) => {
  dialogVisible.value = visible;
};
// 建群成功 服务端会下发IM消息 业务册会收到会话层变动通知 无需手动往会话层插入群聊天
const onConfirm = () => {
  dialogVisible.value = false;
};
const onCancel = () => {
  dialogVisible.value = false;
};

const handleSelect = (item: any) => {
  router.push({
    path: "/messages/main",
    query: {
      userId: item.id,
      realName: item.name,
      iconUrl: item.iconUrl,
      t: Date.now(),
    },
  });
};
const selected = computed(() => {
  const { userId: id, realName: name, avatar: iconUrl } = userStore;
  return [{ id, name, iconUrl }];
});
</script>

<style lang="less" scoped>
.message-search {
  -webkit-app-region: drag;
  :deep(.el-autocomplete) {
    .el-input {
      width: 265px;
      -webkit-app-region: no-drag;
    }
  }
  .add-icon {
    -webkit-app-region: no-drag;
  }
}
</style>
