<template>
  <div
    class="wrap overflow-auto pr-4"
    v-loading="data.loading || structureStore.loading"
  >
    <div class="mt-2 pl-4 mb-4">
      <Breadcrumb
        :departmentID="currentDepartmentId"
        @get-child-node="getChildNode"
      />
    </div>
    <div
      class="pl-6"
      v-infinite-scroll="loadMore"
      :infinite-scroll-immediate="false"
    >
      <!-- 架构列表 -->
      <div
        class="flex justify-between mb-4 cursor-pointer"
        v-for="items in departmentStructureList"
        :key="items.id"
        @click="getStruNode(items)"
      >
        {{ items.name }}
      </div>
      <!-- 人员列表 -->
      <UserList
        :membersDetail="data.list"
        :selectedUserId="props.selectedUserId"
        :date="props.date"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CompanyStructure",
});
</script>

<script lang="ts" setup>
import { listDepartmentMember } from "@/api/department";
import Breadcrumb from "@/components/BreadCrumb/index.vue";
import UserList from "@/components/UserList/index.vue";
import { reactive, watch, ref, computed } from "vue";
import { useStructureStore } from "@/store/modules/contacts";

const structureStore = useStructureStore();
const currentDepartmentId = ref(""); //当前部门id
interface Props {
  childDepartId?: string;
  selectedUserId?: string; //搜索的人员id
  date?: string;
}
const props = defineProps<Props>();

// 初始化，获得我的部门组织架构和人员详情

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
    id: currentDepartmentId.value,
    pageNum: data.pageNum,
    pageSize: data.pageSize,
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
  } else {
    fetchList();
  }
};

// 更新页面
const update = () => {
  data.pageNum = 1;
  data.list = [];
  data.loading = true;
  fetchList();
};
// 加载页面，无路由传参时，初始化组织架构
currentDepartmentId.value = props.childDepartId
  ? props.childDepartId
  : structureStore.rootDepartment?.id;
update();

// 当前组织架构列表
const departmentStructureList = computed(() => {
  return (
    structureStore.wholeStructureList.filter(
      (item: any) => item.parentId === currentDepartmentId.value
    ) || []
  ).sort((a, b) => {
    return b.sequence - a.sequence;
  });
});

// 点击获得子节点
const getStruNode = (val) => {
  currentDepartmentId.value = val.id;
};

// 点击面包屑，更新架构表和面包屑
const getChildNode = (val) => {
  currentDepartmentId.value = val.id;
};

// 通过部门ID切换，更新页面
watch(
  () => currentDepartmentId.value,
  () => {
    update();
  }
);
// 获得选中人组织信息
const getSearchResult = () => {
  if (props.selectedUserId) {
    currentDepartmentId.value = props.childDepartId
      ? props.childDepartId
      : structureStore.rootDepartment?.id;
  }
};
// 通过date判断是否有搜索操作
watch(
  () => props.date,
  () => {
    getSearchResult();
  }
);

// 强制刷新页面后避免架构数据丢失
if (
  structureStore.wholeStructureList.length === 0 &&
  structureStore.loading === false
) {
  structureStore.fetchStructureData();
}

watch(
  () => structureStore.rootDepartment,
  () => {
    if (!currentDepartmentId.value) {
      currentDepartmentId.value = structureStore.rootDepartment?.id;
    }
  }
);
</script>
<style lang="less" scoped>
.detailhover:hover {
  background: rgb(234, 234, 234);
}
.wrap {
  height: calc(
    100vh - var(--contact-header-height) - var(--layout-header-height)
  );
}
</style>
