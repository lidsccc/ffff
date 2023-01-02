<template>
  <div
    class="flex justify-between items-center pr-4 border-b contact-title title-height"
    :class="isWindows ? 'window-size-header' : ''"
  >
    <div class="p-2 pl-4 pt-4 pb-4 text-lg title">
      {{ props.title }}
    </div>
    <el-button
      plain
      size="small"
      color="#00b0bb "
      :icon="User"
      @click="creatGroup"
      v-if="props.showCreateGroup"
      >创建群组</el-button
    >
  </div>
  <ContactSelect
    :visible="creatGroupDialog"
    @on-visible-change="getDialogVisible"
    @on-confirm="onConfirm"
    @on-cancel="cancelContactSelect"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CantactTitle",
});
</script>

<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user";
import { ref, computed } from "vue";
import { User } from "@element-plus/icons-vue";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { ElMessage } from "element-plus";
import { useGlobalStore } from "@/store/modules/global";
import { addGroup } from "@/api/message";

const userStore = useUserStore();
const globalStore = useGlobalStore();

interface Props {
  title?: string;
  showCreateGroup?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  showCreateGroup: false,
});

const isWindows = computed(() => window["$platform"] === "win32");

const creatGroupDialog = ref(false);
//捕获此时弹窗显隐状态
const getDialogVisible = (visible: boolean) => {
  creatGroupDialog.value = visible;
};
//点击按钮控制弹窗显隐
const creatGroup = () => {
  creatGroupDialog.value = !creatGroupDialog.value;
};
//创建群组

const onConfirm = () => {
  addGroup({
    userId: userStore.userId,
    // member: selectedContacts.value.map((item) => item.code),
    member: globalStore.selectedUserList.map((item) => item.id),
  })
    .then(() => {
      ElMessage.success({ message: "创建群组成功" });
      //关闭弹窗时清空仓库
      globalStore.clearSelectedUser();
      creatGroupDialog.value = false;
    })
    .catch((err) => {
      ElMessage.success({ message: `创建群组失败：${err}` });
    });
};
const cancelContactSelect = () => {
  creatGroupDialog.value = false;
};
</script>

<style scoped>
.contact-title {
  box-sizing: border-box;
  height: var(--content-header-height);
}
.window-size-header {
  padding-top: var(--layout-window-size-height);
}
</style>
