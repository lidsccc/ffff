<template>
  <!-- 人员列表 -->
  <div
    v-for="item in props.membersDetail"
    :key="item.id"
    class="mb-2 select-none"
  >
    <el-checkbox
      :model-value="
        globalStore.selectedUserList.some((contact) => contact.id === item.id)
      "
      :disabled="globalStore.selectDisableList.some((i) => i.id === item.id)"
      @change="(checked) => handleSelect(item, checked)"
      v-if="checkable"
    >
      <div
        class="h-10 p-2 pl-4 flex justify-items-center detailhover cursor-pointer w-[270px]"
      >
        <UserAvatar
          :size="26"
          :src="item.iconUrl"
          :name="item.name"
          :id="item.id"
        >
          <span>{{ item.name[0] }}</span>
        </UserAvatar>
        <span class="pl-2 leading-6 user-name">{{ item.name }}</span>
      </div>
    </el-checkbox>

    <div
      class="h-10 p-2 pl-4 flex justify-items-center detailhover cursor-pointer"
      :class="props.selectedUserId === item.id ? 'selected' : ''"
      @click="showDetail(item)"
      v-else
    >
      <UserAvatar
        :size="26"
        :src="item.iconUrl"
        :name="item.name"
        :id="item.id"
      >
        <span>{{ item.name[0] }}</span>
      </UserAvatar>
      <span class="pl-2 leading-6 user-name">{{ item.name }}</span>
    </div>
  </div>
  <div class="dialog-container">
    <el-dialog v-model="detailDialogVisible" width="400px" destroy-on-close>
      <UserDetail :id="selectedUserId" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "UserList",
});
</script>

<script lang="ts" setup>
import UserDetail from "@/components/UserDetail/index.vue";
import { ref, inject, watch } from "vue";
import { useGlobalStore } from "@/store/modules/global";
import { UserListItemDetail } from "./type";
import UserAvatar from "@/components/UserAvatar/index.vue";

type Props = {
  membersDetail: UserListItemDetail[];
  selectedUserId?: string;
  date?: string;
};
const props = defineProps<Props>();
const globalStore = useGlobalStore();

const detailDialogVisible = ref(false);

// 展示人员详情卡片
const selectedUserId = ref("");
const showDetail = (detail: UserListItemDetail) => {
  detailDialogVisible.value = true;
  selectedUserId.value = detail.id;
};

const handleSelect = (item, checked) => {
  if (checked) {
    globalStore.addSelectedUser(item);
  } else {
    globalStore.delSelectedUser(item);
  }
};

//在群组选人组件展示checkbox
let checkable = inject("checkable");
const scroll = () => {
  setTimeout(() => {
    //TODO 利用定时器获得节点,nextTick未生效
    document.querySelector(".selected").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 200);
};

// 从其他页面跳转到组织架构时
if (props.selectedUserId) {
  scroll();
}
// 在组织架构页面搜索时
watch(
  () => props.date,
  () => {
    if (props.selectedUserId) {
      scroll();
      // nextTick(() => {
      //  document.querySelector(".selected").scrollIntoView({
      //   behavior: "smooth",
      //   block: "start",
      // });
      // });
    }
  }
);
</script>

<style scoped lang="less">
.el-checkbox__label {
  width: 330px;
}

.detailhover:hover {
  background: rgb(234, 234, 234);
}
.selected {
  background: rgb(234, 234, 234);
}
.user-name {
  @apply whitespace-nowrap w-3/5 text-ellipsis overflow-hidden;
}
</style>
