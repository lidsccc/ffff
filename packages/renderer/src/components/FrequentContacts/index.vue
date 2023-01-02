<template>
  <div class="pl-4 wrap overflow-auto pr-4" v-loading="data.loading">
    <div
      v-infinite-scroll="loadMore"
      :infinite-scroll-immediate="false"
      v-if="data.list.length"
    >
      <UserList :membersDetail="data.list" />
    </div>
    <div v-else>
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "FrequentContacts",
});
</script>

<script lang="ts" setup>
import { reactive } from "vue";
import { useUserStore } from "@/store/modules/user";
import { listTopContact } from "@/api/contacts";
import UserList from "@/components/UserList/index.vue";
//从store中拿到用户ID
const userStore = useUserStore();
const userId = userStore.userId;
//获得联系人列表
const data = reactive({
  loading: true,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 20,
  hasMore: true,
});
const fetchList = async () => {
  const { list } = data;
  data.loading = true;
  const { items = [], total } = await listTopContact({
    userId,
    pageNum: data.pageNum,
    pageSize: data.pageSize,
  });
  items.forEach((currentVal) => {
    let temp = currentVal.id;
    currentVal.id = currentVal.code;
    currentVal.code = temp;
  });
  data.list = list.concat(items);
  data.total = total;
  data.hasMore = data.list.length < total;
  data.loading = false;
};
const loadMore = () => {
  data.pageNum++;
  if (!data.hasMore || data.loading) {
    return;
  }
  fetchList();
};
fetchList();
</script>

<style scoped>
.wrap {
  height: calc(
    100vh - var(--contact-header-height) - var(--layout-header-height)
  );
}
</style>
