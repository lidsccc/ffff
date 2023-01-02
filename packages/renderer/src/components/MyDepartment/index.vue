<template>
  <div
    class="wrap overflow-auto pr-4"
    v-loading="data.loading || structureStore.loading"
  >
    <div class="mt-2 pl-4 mb-4">
      <Breadcrumb
        :departmentID="structureStore.myDepartmentId"
        :checkable="checkable"
        @get-child-node="departToStructure"
      />
    </div>
    <div
      v-infinite-scroll="loadMore"
      :infinite-scroll-immediate="false"
      :infinite-scroll-distance="5"
    >
      <div class="ml-4">
        <UserList :membersDetail="data.list" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "MyDepartment",
});
</script>

<script lang="ts" setup>
import { listDepartmentMember } from "@/api/department";

import { reactive, inject, watch } from "vue";
import { useRouter } from "vue-router";
import Breadcrumb from "@/components/BreadCrumb/index.vue";
import UserList from "@/components/UserList/index.vue";
import { useStructureStore } from "@/store/modules/contacts";

const structureStore = useStructureStore();

const router = useRouter();

//获得我的部门及成员数据
const loadMore = () => {
  data.pageNum++;
  if (!data.hasMore || data.loading) {
    return;
  }
  fetchList();
};
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
  const { items = [], total } = await listDepartmentMember({
    id: structureStore.myDepartmentId,
    pageNum: data.pageNum,
    pageSize: data.pageSize,
  });

  data.list = list.concat(items);
  data.total = total;
  data.hasMore = data.list.length < total;
  data.loading = false;
};

// 初始化页面

fetchList();

//在此页面点击面包屑，跳转至“组织架构”
const departToStructure = (val) => {
  router.push({
    path: "/contacts/main/structure",
    query: {
      id: val.id,
    },
  });
};

let checkable = inject("checkable");
// 强制刷新页面后避免架构数据丢失
if (
  structureStore.wholeStructureList.length === 0 &&
  structureStore.loading === false
) {
  structureStore.fetchStructureData();
}

watch(
  () => structureStore.myDepartmentId,
  () => {
    fetchList();
  }
);
</script>
<style scoped>
.detailhover:hover {
  background: rgb(234, 234, 234);
}
.wrap {
  height: calc(
    100vh - var(--contact-header-height) - var(--layout-header-height)
  );
}
</style>
