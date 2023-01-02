<template>
  <div class="w-60 h-full bg-white select-none">
    <el-menu
      class="el-menu-vertical-demo"
      active-text-color="#00b0bb"
      default-active="doing"
    >
      <el-menu-item
        v-for="item in NavList"
        :index="item.id"
        :key="item.id"
        @click="handleSelectTask(item.status)"
      >
        <div class="flex justify-between w-full">
          <div class="flex items-center">
            <img :src="item.avatar" class="h-5 mr-2" />
            <div>{{ item.title }}</div>
          </div>
          <div class="pr-4">{{ TaskStore.taskCount[item.id] }}</div>
        </div>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
export default defineComponent({
  name: "NavList",
});
</script>

<script lang="ts" setup>
import { useTaskStore } from "@/store/modules/task";
import TaskDoingIcon from "@/assets/task-doing.png";
// import TaskParticipateIcon from "@/assets/task-participate.png";
import TaskInchargeIcon from "@/assets/task-incharge.png";
import TaskGetIcon from "@/assets/task-get.png";
import TaskFinished from "@/assets/task-finished.png";
import {
  NavListType,
  FinishedType,
  TaskType,
  NavListId,
} from "@/enums/taskStatus";

export interface NavListItem {
  id: NavListId;
  avatar: string;
  title: NavListType;
  status: TaskType | FinishedType;
}

const NavList = reactive<NavListItem[]>([
  {
    id: NavListId.Doing,
    avatar: TaskDoingIcon,
    title: NavListType.DOING,
    status: TaskType.ALL,
  },
  // {
  //   id: NavListId.Join,
  //   avatar: TaskParticipateIcon,
  //   title: NavListType.JOIN,
  //   status: TaskType.JOIN,
  // },
  {
    id: NavListId.Done,
    avatar: TaskFinished,
    title: NavListType.FINISHED,
    status: FinishedType.ALL,
  },
  {
    id: NavListId.Create,
    avatar: TaskInchargeIcon,
    title: NavListType.MANAGE,
    status: TaskType.MANAGE,
  },
  {
    id: NavListId.Share,
    avatar: TaskGetIcon,
    title: NavListType.RECEIVED,
    status: TaskType.RECEIVED,
  },
]);
const TaskStore = useTaskStore();
const emitTaskType = defineEmits<{
  (event: "change-task-type", data: TaskType): void;
}>();
let selectedType: TaskType;
const handleSelectTask = (type: number) => {
  if (type === selectedType) {
    return;
  }
  emitTaskType("change-task-type", type);
  selectedType = type;
};
</script>

<style lang="less" scoped>
.message-record {
  width: 320px;
}
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
  padding: 0 0 0 10px !important;
  box-sizing: border-box;
  margin-left: 10px;
}
</style>
