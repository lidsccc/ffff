<template>
  <div class="pl-2 wrap pr-4">
    <el-tabs class="demo-tabs" v-model="activeName">
      <el-tab-pane label="我管理的群组" name="leaderGroup">
        <GroupJoin :groupList="ManageGroupList" />
      </el-tab-pane>
      <el-tab-pane label="我加入的群组" name="joinGroup">
        <GroupJoin :groupList="groupJoinList" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "GroupIndex",
});
</script>

<script lang="ts" setup>
import { reactive, ref, computed } from "vue";
import GroupJoin from "@/components/Group/groupJoin.vue";
import { listMyGroup } from "@/api/message";
import { useUserStore } from "@/store/modules/user";
import { GroupMemberType } from "@/enums/message";
const activeName = ref("leaderGroup");

//从store中拿到用户ID
const userStore = useUserStore();
const userId = userStore.userId;
const data = reactive({
  loading: true,
  list: [],
  pageNum: 1,
  pageSize: 99999,
});
const fetchList = async () => {
  const { list } = data;
  data.loading = true;
  const { items = [] } = await listMyGroup({
    userId,
    pageNum: data.pageNum,
    pageSize: data.pageSize,
  });

  data.list = list.concat(items);
  data.loading = false;
};
fetchList();
const ManageGroupList = computed(() => {
  return data.list.filter((item: object) => {
    return (
      item.memberType === GroupMemberType.LEADER ||
      item.memberType === GroupMemberType.MANAGER
    );
  });
});
const groupJoinList = computed(() => {
  return data.list.filter((item: object) => {
    return item.memberType === GroupMemberType.NORMAL;
  });
});
</script>

<style scoped>
.el-tabs__item.is-active {
  color: var(--theme-color);
}
.el-tabs__active-bar {
  background-color: var(--theme-color);
}

.el-tabs--top.demo-tabs {
  height: 100%;
}
::v-deep(.el-tabs__content) {
  position: relative;
  /* overflow: auto; */
  /* height: 80%; */
}
.wrap {
  height: calc(
    100vh - var(--contact-header-height) - var(--layout-header-height)
  );
}
</style>
