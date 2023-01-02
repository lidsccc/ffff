<template>
  <div class="group-management">
    <el-collapse v-model="groupManageActiveNames" class="relative">
      <el-collapse-item name="1">
        <template #title>群管理</template>
        <div class="text-xs mb-2">群主/编辑群管理</div>
        <div class="flex flex-wrap gap-3">
          <div
            class="w-12 flex flex-col items-center border-r pr-4 border-gray-300"
          >
            <el-avatar
              :size="24"
              :src="get(props.groupDetail, 'leader.avatar')"
              >{{
            }}</el-avatar>
            <div class="w-10 mt-1 text-xs text-center truncate">
              {{ get(props.groupDetail, "leader.realName") }}
            </div>
          </div>

          <div
            v-for="item in groupManagerList"
            :key="item.userId"
            class="w-10 flex flex-col items-center"
          >
            <el-avatar :size="24" :src="get(item, 'user.avatar')">{{
              get(item, "user.realName[0]")
            }}</el-avatar>
            <div class="w-10 mt-1 text-xs text-center truncate">
              {{ get(item, "user.realName") }}
            </div>
          </div>
          <div
            class="w-10 flex flex-col justify-center items-center rounded hover:bg-gray-100"
          >
            <EditGroupManager
              :memberList="props.groupMember"
              title="编辑管理员"
              @on-manager-change="fetchGroupMember"
            >
              <img
                src="@/assets/manager-edit.png"
                class="w-6 h-6 cursor-pointer"
            /></EditGroupManager>
          </div>
        </div>
        <div
          class="mt-2 text-xs default-color cursor-pointer"
          @click="handleTransferGroupLeaderVisible(false)"
        >
          转让群主
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "GroupManagement",
});
</script>
<script lang="ts" setup>
import { ref, computed } from "vue";
import { get } from "lodash-es";
import { GroupMemberType } from "@/enums/message";
import EditGroupManager from "@/components/EditGroupManager/index.vue";
interface Props {
  groupDetail: any;
  groupMember: any[];
}
const props = defineProps<Props>();
const emits = defineEmits(["on-group-change", "on-fetch-groupMember"]);

const handleTransferGroupLeaderVisible = (needQuit: boolean) => {
  emits("on-group-change", needQuit);
};
const fetchGroupMember = () => {
  emits("on-fetch-groupMember");
};
const groupManageActiveNames = ref("");

//  群组管理员列表
const groupManagerList =
  computed(() => {
    return props.groupMember.filter(
      (items: any) => get(items, "memberType") === GroupMemberType.MANAGER
    );
  }) || [];
</script>

<style lang="less" scoped>
.default-color {
  color: var(--theme-color);
}
.group-management {
  :deep(.el-collapse-item__content) {
    padding-bottom: 10px;
  }
  :deep(.el-collapse) {
    border-top: none;
  }
  :deep(.el-collapse-item__arrow) {
    font-size: 1.2rem;
    margin: 0 -5px 0 auto;
    color: #999999;
  }
}
</style>
