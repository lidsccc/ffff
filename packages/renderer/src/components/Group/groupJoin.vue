<template>
  <div v-show="props.groupList?.length">
    <div v-if="!checkable" class="overflow-auto list-wrap">
      <div
        class="h-10 p-2 pl-4 flex items-center group cursor-pointer"
        v-for="item in props.groupList"
        :key="item.groupId"
        @click="startChat(item)"
      >
        <UserAvatar
          :size="26"
          class="cursor-pointer"
          :src="item.iconUrl || Default_Group_Avatar"
        />
        <span class="pl-2 text-sm group-name">{{ item.name }}</span>
        <div
          class="text-xs h-4 w-8 text-center leading-4 ml-2 departSuffix"
          v-if="item.isOfficial"
        >
          部门
        </div>
      </div>
    </div>
    <div v-else class="overflow-auto h-[150px]">
      <div class="mb-2" v-for="item in props.groupList" :key="item.groupId">
        <el-checkbox
          @change="(checked) => handleSelect(item, checked)"
          :model-value="
            globalStore.selectedUserList.some(
              (contact) => contact.id === item.groupId
            )
          "
        >
          <div
            class="h-10 p-2 pl-4 flex items-center group cursor-pointer w-[270px]"
          >
            <UserAvatar
              :size="26"
              class="cursor-pointer"
              :src="item.iconUrl || Default_Group_Avatar"
              :name="get(item, 'name[0]')"
            >
              <span>{{ get(item, "name[0]") }}</span>
            </UserAvatar>
            <span class="pl-2 text-sm group-name">{{ item.name }}</span>
            <div
              class="text-xs h-4 w-8 text-center leading-4 ml-2 departSuffix"
              v-if="item.isOfficial"
            >
              部门
            </div>
          </div>
        </el-checkbox>
      </div>
    </div>
  </div>
  <div v-if="!props.groupList?.length">
    <el-empty description="暂无数据" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "GroupJoin",
});
</script>

<script lang="ts" setup>
import { inject } from "vue";
import { groupItemType } from "./type";
import { useGlobalStore } from "@/store/modules/global";
import { Default_Group_Avatar } from "@/constant/base64";
import { useRouter } from "vue-router";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";

const globalStore = useGlobalStore();
type Props = {
  groupList: any[];
};
const props = defineProps<Props>();
const handleSelect = (item, checked) => {
  //处理群组字段，方便数据统一处理
  const groupItem: groupItemType = {
    id: item.groupId,
    name: item.name,
    iconUrl: item.iconUrl,
    isGroup: true,
  };
  if (checked) {
    globalStore.addSelectedUser(groupItem);
  } else {
    globalStore.delSelectedUser(groupItem);
  }
};

const router = useRouter();

const startChat = (item: any) => {
  router.push({
    path: "/messages/main",
    query: {
      userId: item.groupId,
      realName: item.name,
      iconUrl: item.iconUrl,
      isGroup: 1,
      t: Date.now(), // 让每次点击发起会话都能能感知变化
    },
  });
};
const checkable = inject("checkable");
</script>

<style lang="less" scoped>
.departSuffix {
  background-color: #ddeef3;
  color: var(--theme-color);
}
.group:hover {
  background: rgb(234, 234, 234);
}
.list-wrap {
  height: calc(100vh - 120px);
}
.group-name {
  @apply whitespace-nowrap text-ellipsis overflow-hidden w-3/5;
}
.infinite-list {
  height: 300px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: var(--el-color-primary-light-9);
  margin: 10px;
  color: var(--el-color-primary);
}
.infinite-list .infinite-list-item + .list-item {
  margin-top: 10px;
}
</style>
