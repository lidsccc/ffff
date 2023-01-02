<template>
  <el-dialog
    :modelValue="props.visible"
    @update:model-value="changeVisible"
    :title="props.title"
    :append-to-body="props.appendToBody"
    top="10vh"
    width="90%"
    custom-class="contact-dialog"
    destroy-on-close
  >
    <div class="flex divide-x h-4/5">
      <div class="w-1/2 pl-2 pr-8 wrap">
        <AutoCompleteSearch @on-select="handleSelect" />

        <el-collapse :accordion="accordion" v-model="activeName">
          <el-collapse-item name="1">
            <template #title>
              <div class="title">
                <img class="h-4" src="@/assets/structure-plain.png" alt="" />
                <span class="pl-4">组织架构</span>
              </div>
            </template>
            <CompanyStructure />
          </el-collapse-item>
          <el-collapse-item name="2">
            <template #title>
              <div class="title">
                <img class="h-4" src="@/assets/department-plain.png" alt="" />
                <span class="pl-4">我的部门</span>
              </div>
            </template>

            <MyDepartment />
          </el-collapse-item>
          <el-collapse-item name="3">
            <template #title>
              <div class="title">
                <img class="h-4" src="@/assets/contacts-plain.png" alt="" />
                <span class="pl-4">常用联系人</span>
              </div>
            </template>

            <FrequentContacts />
          </el-collapse-item>
          <el-collapse-item name="4" v-if="props.showGroup">
            <template #title>
              <div class="title">
                <img class="h-4" src="@/assets/groupIcon.png" alt="" />
                <span class="pl-4">我的群组</span>
              </div>
            </template>
            <groupIndex />
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="w-1/2 pl-8 pr-2">
        <div class="flex justify-between mb-2">
          <div class="title">已选联系人</div>
          <div class="text-gray">
            已选{{ globalStore.selectedUserList.length }}人
          </div>
        </div>
        <div class="user-list">
          <div
            v-for="item in globalStore.selectedUserList"
            :key="item.id"
            class="flex justify-between items-center py-2"
          >
            <div class="flex items-center">
              <UserAvatar
                :size="26"
                :src="item.iconUrl"
                :name="item.name"
                :id="item.id"
              >
                <span>{{ get(item, "name[0]") }}</span>
              </UserAvatar>
              <div class="ml-4">{{ item.name }}</div>
            </div>
            <div
              @click="deleteSelectedContact(item)"
              class="w-6 h-6 flex items-center justify-center cursor-pointer rounded hover:bg-gray-300"
            >
              <img src="@/assets/close-btn.png" class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div>
        <el-button @click="onCancel">取消</el-button>
        <el-button
          type="primary"
          @click="onConfirm"
          :disabled="confirmButtonDisable"
          >确定</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ContactSelect",
});
</script>

<script lang="ts" setup>
import { ref, provide, withDefaults, watch, onMounted } from "vue";
import AutoCompleteSearch from "@/components/AutoCompleteSearch/index.vue";
import CompanyStructure from "@/components/Structure/index.vue";
import MyDepartment from "@/components/MyDepartment/index.vue";
import FrequentContacts from "@/components/FrequentContacts/index.vue";
import groupIndex from "@/components/Group/groupIndex.vue";
import { useGlobalStore } from "@/store/modules/global";
import { selectedUser } from "@/components/TaskComponents/type";
import { ElMessage } from "element-plus";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";

const globalStore = useGlobalStore();
interface Props {
  visible: boolean;
  selected?: selectedUser[];
  title?: string;
  showGroup?: boolean;
  maxLimit?: number;
  minLimit?: number;

  appendToBody?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "选择联系人",
  showGroup: false,
  maxLimit: Number.MAX_VALUE,
  minLimit: 1,

  selected: () => [],
  appendToBody: false,
});
const emits = defineEmits(["on-visible-change", "on-cancel", "on-confirm"]);
//为解决下拉菜单bug
const activeName = ref(["1", "2", "3", "4"]);
const accordion = ref(false);
onMounted(() => {
  activeName.value = [];
  accordion.value = true;
});
// 控制子组件checkbox显隐
provide("checkable", true);
//打开时自动选中传入名单，关闭时清空
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      globalStore.setSelectedUserList(props.selected);
    } else {
      globalStore.clearSelectedUser();
    }
  }
);

const keyword = ref("");

const deleteSelectedContact = (item) => {
  globalStore.delSelectedUser(item);
};

const changeVisible = (visible) => {
  emits("on-visible-change", visible);
};
const onCancel = () => {
  emits("on-cancel");
};
const onConfirm = () => {
  const { selectedUserList = [] } = globalStore;
  emits("on-confirm", selectedUserList);
};

const handleSelect = (item) => {
  if (globalStore.selectDisableList.some((i) => i.id === item.id)) {
    ElMessage.error({ message: "该联系人不可被选择" });
    keyword.value = "";
    return;
  }
  globalStore.addSelectedUser({
    id: item.id,
    name: item.name,
    iconUrl: item.iconUrl,
  });
};

// 按钮置灰判断
const confirmButtonDisable = ref(false);
const isConfirmButtonDisable = () => {
  confirmButtonDisable.value =
    globalStore.selectedUserList.length < props.minLimit ||
    globalStore.selectedUserList.length > props.maxLimit;
};
isConfirmButtonDisable();
watch(
  () => globalStore.selectedUserList,
  () => {
    isConfirmButtonDisable();
  }
);
</script>

<style lang="less">
.contact-dialog {
  height: 80vh;
  .el-dialog__header {
    padding: 10px 20px;
    display: flex;
    align-items: center;
  }
  .el-dialog__body {
    height: 65vh;
    overflow: auto;
    padding: 0 10px 10px 10px;
  }
  .wrap {
    height: 30vh;
  }
}
</style>
<style lang="less" scoped>
.title {
  @apply font-medium  cursor-pointer flex items-center;
}
:deep(.el-tabs__item) {
  height: 35px;
}
.contact-select {
  :deep(.el-dialog__header) {
    padding: 10px 20px;
    display: flex;
    align-items: center;
  }
  :deep(.el-dialog__headerbtn) {
    top: 10px;
  }
  :deep(.el-dialog__body) {
    padding: 0 10px 10px 10px;
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
:deep(.el-tabs__content) {
  overflow: unset;
}
.user-list {
  height: 336px;
  overflow: auto;
}
.contact-select .wrap {
  height: 30vh;
}
</style>
