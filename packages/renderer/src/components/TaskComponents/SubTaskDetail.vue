<template>
  <div class="">
    <div class="w-full task-split px-4 py-2 flex justify-between">
      <div class="flex items-center leading-3">
        <div class="mr-4">任务拆分</div>
        <el-icon
          class="cursor-pointer"
          v-show="props.isCreator"
          @click="createSubtask"
          ><Plus
        /></el-icon>
      </div>

      <el-tooltip
        class="tip-item"
        effect="dark"
        content="筛选与我相关的任务"
        placement="top-start"
      >
        <img
          class="h-4 cursor-pointer"
          :src="isTaskRelated ? filterActiveIcon : filterIcon"
          alt=""
          @click="filtrateTask"
        />
      </el-tooltip>
    </div>
    <div v-for="item in props.taskDetailList" class="p-4" :key="item.id">
      <SubTaskPanel
        :taskDetail="item"
        @del-subtask="delSubTask"
        @get-new-subtask="getNewSubtask"
        @get-new-progress="getNewProgress"
      />
    </div>
    <el-empty v-if="!props.taskDetailList.length" description="暂无数据" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "SubTaskDetail",
});
</script>

<script lang="ts" setup>
import { ref } from "vue";
import SubTaskPanel from "@/components/TaskComponents/SubTaskPanel.vue";
import { subTaskDeatil } from "@/components/TaskComponents/type";
import filterIcon from "@/assets/filter.png";
import filterActiveIcon from "@/assets/filter-active.png";
import { Plus } from "@element-plus/icons-vue";

type Props = {
  taskDetailList: subTaskDeatil[];
  isCreator?: boolean;
};
const props = defineProps<Props>();
const isTaskRelated = ref(false); // 是否与我相关
const filtrateTask = () => {
  isTaskRelated.value = !isTaskRelated.value;
  emits("filtrate-related-task", isTaskRelated.value);
};
const emits = defineEmits([
  "del-subtask",
  "get-new-subtask",
  "get-new-progress",
  "filtrate-related-task",
  "create-subtask",
]);

const delSubTask = (id: string) => {
  emits("del-subtask", id);
};
const getNewSubtask = () => {
  emits("get-new-subtask");
};
const getNewProgress = () => {
  emits("get-new-progress");
};
const createSubtask = () => {
  emits("create-subtask");
};
</script>

<style lang="less" scoped>
.task-split {
  background: #f7f7f7;
}
.tip-item {
  width: 100px;
  height: 20px;
}
</style>
