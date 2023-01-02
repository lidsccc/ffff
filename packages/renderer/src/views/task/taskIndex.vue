<template>
  <div class="flex flex-row h-full">
    <div class="flex flex-col h-full">
      <div class="w-60">
        <TaskSearch />
      </div>
      <NavList @change-task-type="changeTaskType" />
    </div>
    <DoingList />
  </div>
</template>
<script lang="ts">
import TaskSearch from "@/components/TaskComponents/Search.vue";
import NavList from "@/components/TaskComponents/NavList.vue";
import DoingList from "@/components/TaskComponents/DoingList.vue";
export default {
  components: DoingList,
};
</script>

<script lang="ts" setup>
import { watch } from "vue";
import { useTaskStore } from "@/store/modules/task";
import { FinishedType, TaskType } from "@/enums/taskStatus";

const TaskStore = useTaskStore();
const changeTaskType = (taskType: TaskType | FinishedType) => {
  TaskStore.$patch((state) => {
    state.taskType = taskType;
    state.finishedType =
      state.taskType === FinishedType.ALL
        ? FinishedType.ALL
        : FinishedType.UNFINISHED;
  });
};
watch(
  () => TaskStore.taskType,
  () => {
    TaskStore.initialTaskMsg();
  }
);
//初次加载时默认加载“进行中”
TaskStore.$patch((state) => {
  state.taskType = TaskType.ALL;
});
TaskStore.initialTaskMsg();
TaskStore.fetchTaskCount();
</script>

<style lang="less" scoped>
.el-menu {
  --el-menu-item-height: 40px;
  border: none;
  width: 95%;
}
.el-menu-item:hover {
  background-color: rgb(245, 245, 245);
  border-radius: 4px;
}
.el-menu-item {
  padding: 0 0 0 10px;
  box-sizing: border-box;
  margin-left: 10px;
}
</style>
