<template>
  <ContactSelect
    :visible="visible"
    :selected="props.selected || []"
    :minLimit="3"
    @on-visible-change="handleVisibleChange"
    @on-confirm="onConfirm"
    @on-cancel="onCancel"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CreateGroupDialog",
});
</script>

<script lang="ts" setup>
import { computed } from "vue";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { addGroup } from "@/api/message";
import { useUserStore } from "@/store/modules/user";
import { useGlobalStore } from "@/store/modules/global";
import { ElMessage } from "element-plus";
import { selectedUser } from "@/components/TaskComponents/type";

const userStore = useUserStore();
const globalStore = useGlobalStore();

interface Props {
  visible: boolean;
  selected?: selectedUser[];
  title?: string;
  showGroup?: boolean;
}
const props = defineProps<Props>();
const emits = defineEmits(["on-change-visible", "on-confirm", "on-cancel"]);

const visible = computed(() => props.visible);
const handleVisibleChange = (visible: boolean) => {
  emits("on-change-visible", visible);
};
const onConfirm = () => {
  addGroup({
    userId: userStore.userId,
    member: globalStore.selectedUserList.map((item) => item.id),
  })
    .then(() => {
      ElMessage.success({ message: "创建群组成功" });
      emits("on-confirm");
    })
    .catch((err: any) => {
      ElMessage.error({ message: `${err}` });
    });
};
const onCancel = () => {
  emits("on-cancel");
};
</script>

<style lang="less" scoped>
.title {
  @apply font-medium  cursor-pointer flex items-center;
}
:deep(.el-tabs__item) {
  height: 35px;
}
.dialog-body {
  :deep(.el-dialog__body) {
    padding: 10px 10px 60px 10px;
  }
}
:deep(.el-collapse-item__content) {
  padding-bottom: 8px;
}

:deep(.el-collapse-item__header) {
  border-bottom: none;
  height: 30px;
}
.el-collapse {
  border: none;
}
:deep(.el-collapse-item__wrap) {
  border: none;
}
</style>
