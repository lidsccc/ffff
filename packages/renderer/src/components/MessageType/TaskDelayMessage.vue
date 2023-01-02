<template>
  <div class="h-16 bg-[#00b0bb] px-[12px] pt-2 text-white">
    <div class="mb-1">通知</div>
    <div>您有条任务存在滞后风险</div>
  </div>
  <div @click="drawer = true">
    <slot></slot>
  </div>
  <div>
    <el-drawer
      v-model="drawer"
      title="任务督办"
      :destroy-on-close="true"
      :append-to-body="true"
      :show-close="false"
      modal-class="delay-drawer"
      size="65%"
    >
      <template #header>
        <div class="border-b-2 pb-2 text-lg select-none">
          <div class="text-black flex items-center">
            <el-icon class="cursor-pointer mr-2" @click="drawer = false"
              ><arrow-left-bold
            /></el-icon>

            <span>系统督办</span>
          </div>
        </div>
      </template>
      <template #default>
        <div
          v-infinite-scroll="loadMore"
          class="flex flex-wrap pl-4 pb-4 overflow-auto task-panel-wrap content-start"
        >
          <div
            class="mr-4 mt-4 task-panel"
            v-for="item in data.list"
            :key="item.id"
          >
            <TaskPanel :taskDetail="item" @click="handleDetailDrawer(item)" />
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TaskDelayMessage",
});
</script>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { getDelayTask } from "@/api/task";
import TaskPanel from "@/components/TaskComponents/TaskPanel.vue";
const drawer = ref(false);
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
  const { items = [], total } = await getDelayTask({
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
  }
  fetchList();
};
fetchList();
const emits = defineEmits(["on-detail-drawer-open"]);
const handleDetailDrawer = (item) => {
  emits("on-detail-drawer-open", item.id);
};
</script>

<style lang="less" scoped>
.text-gray {
  color: var(--theme-text-gray);
}
.task-panel {
  width: 47%;
}
.task-panel-wrap {
  height: calc(100% - 16px);
}
</style>
<style lang="less">
.delay-drawer {
  .el-drawer {
    background-color: #f1f2f3;
  }

  .el-drawer__header {
    padding-right: 0;
    padding-top: 30px;
    margin-bottom: 0;
  }
  .el-drawer__body {
    padding: 0;
  }
}
</style>
