<template>
  <div class="w-full">
    <div
      class="pr-7 pl-4 border-b text-lg flex justify-between items-center task-head select-none"
      :class="isWindows ? 'window-size-header' : ''"
    >
      {{ taskTitleMap[TaskStore.taskType] }}
      <div v-if="!(TaskStore.taskType === FinishedType.ALL)">
        <el-dropdown trigger="click" size="default " @command="changeSort">
          <el-button type="primary" size="small">
            {{ sort }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="TaskSort.CreatSort"
                >最近创建</el-dropdown-item
              >
              <el-dropdown-item :command="TaskSort.CloseSort"
                >最近截止</el-dropdown-item
              >
              <el-dropdown-item :command="TaskSort.UpdateSort"
                >最近更新</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-else>
        <el-dropdown
          trigger="click"
          size="default "
          @command="changeFinishedType"
        >
          <el-button type="primary" size="small">
            {{ finishStatus }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="FinishedType.ALL">
                全部
              </el-dropdown-item>
              <el-dropdown-item :command="FinishedType.FINISHED"
                >任务完成</el-dropdown-item
              >
              <el-dropdown-item :command="FinishedType.SHUTDOWN"
                >任务关闭</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div v-loading="TaskStore.taskMsg.loading" class="h-full">
      <div
        class="flex items-center justify-center"
        v-if="taskList.length === 0 && !TaskStore.taskMsg.loading"
      >
        <el-empty description="暂无数据" />
      </div>
      <div
        v-infinite-scroll="load"
        class="flex flex-wrap pl-4 pb-4 overflow-auto task-panel-wrap content-start"
      >
        <div
          class="mr-4 mt-4 task-panel"
          v-for="item in taskList"
          :key="item.id"
          @click="handleDrawer(item)"
        >
          <TaskPanel :taskDetail="item" />
        </div>
      </div>
    </div>
    <div v-if="drawer">
      <TaskDetailDrawer :taskId="taskId" @on-visible-change="changeVisible" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "DoingList",
});
</script>

<script lang="ts" setup>
import TaskPanel from "@/components/TaskComponents/TaskPanel.vue";
import TaskDetailDrawer from "@/components/TaskComponents/TaskDetailDrawer.vue";
import { ref, watch, computed } from "vue";
import { useTaskStore } from "@/store/modules/task";
import { selectTaskList } from "@/store/modules/task";
import { TaskSort, FinishedType, TaskType } from "@/enums/taskStatus";

const isWindows = computed(() => window["$platform"] === "win32");

const TaskStore = useTaskStore();
const taskList = ref<selectTaskList[]>([]);

const taskTitleMap = {
  [TaskType.ALL]: "我的待办",
  // [TaskType.JOIN]: "我参与的",
  [TaskType.MANAGE]: "我创建的",
  [TaskType.RECEIVED]: "我关注的",
  [FinishedType.ALL]: "我的已办",
};
const taskSortMap = {
  [TaskSort.CreatSort]: "最近创建",
  [TaskSort.CloseSort]: "最近截止",
  [TaskSort.UpdateSort]: "最近更新",
};
const taskFinishStatusMap = {
  [FinishedType.ALL]: "全部",
  [FinishedType.FINISHED]: "任务完成",
  [FinishedType.SHUTDOWN]: "任务关闭",
};
const sort = ref(taskSortMap[TaskSort.CreatSort]);
watch(
  () => TaskStore.taskMsg.selectTaskList,
  () => {
    taskList.value = TaskStore.taskMsg.selectTaskList;
  }
);

const load = async () => {
  await TaskStore.fetchTaskList();
};
//切换排序逻辑
const listSort = ref(TaskSort.CreatSort);
const changeSort = (sortOption: TaskSort) => {
  listSort.value = sortOption;
  TaskStore.initialTaskMsg();
  TaskStore.fetchTaskList(listSort.value);
};
watch(
  () => listSort.value,
  () => {
    sort.value = taskSortMap[listSort.value];
  }
);
//在已完成页面筛选已完成任务的类型（完成、关闭、全部）
const finishStatus = ref(taskSortMap[TaskSort.CreatSort]);
const changeFinishedType = (finishType: FinishedType) => {
  TaskStore.initialTaskMsg();
  TaskStore.$patch((state) => {
    state.finishedType = finishType;
  });
  TaskStore.fetchTaskList();
};
watch(
  () => TaskStore.finishedType,
  () => {
    finishStatus.value = taskFinishStatusMap[TaskStore.finishedType];
  }
);
//切换任务类型时，排序变为默认值并拉取列表
watch(
  () => TaskStore.taskType,
  () => {
    listSort.value = TaskSort.CreatSort;
    TaskStore.fetchTaskList();
  }
);
//任务详情弹窗
const drawer = ref(false);
const taskId = ref("");
const handleDrawer = (detail: selectTaskList) => {
  drawer.value = !drawer.value;
  taskId.value = detail.id;
};

const changeVisible = (visible: boolean) => {
  drawer.value = visible;
};
</script>

<style lang="less" scoped>
.task-panel {
  width: 47%;
}

//任务列表页title
.task-panel-wrap {
  height: calc(100% - var(--content-header-height));
}
.task-head {
  box-sizing: border-box;
  height: var(--content-header-height);
}
.window-size-header {
  padding-top: var(--layout-window-size-height);
}
</style>
