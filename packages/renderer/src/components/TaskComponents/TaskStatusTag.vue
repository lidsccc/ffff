<template>
  <div
    class="mr-2 rounded-full text-white w-12 text-center"
    :class="taskStatusColorMap[props.taskStatus]"
  >
    {{ taskStatusTagMap[props.taskStatus] }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "TaskStatusTag",
});
</script>

<script lang="ts" setup>
import { FinishedType, taskStatusTagContent } from "@/enums/taskStatus";
type Props = {
  taskStatus: FinishedType;
};
const props = defineProps<Props>();

// 任务状态所对应的标签类名
const taskStatusColorMap = {
  [FinishedType.DELAYED]: "delayed",
  [FinishedType.UNFINISHED]: "unfinished",
  [FinishedType.FINISHED]: "finished",
  [FinishedType.SHUTDOWN]: "shutdown",
};
// 任务状态所对应的标签
const taskStatusTagMap = {
  [FinishedType.DELAYED]: taskStatusTagContent.Delay,
  [FinishedType.UNFINISHED]: taskStatusTagContent.Unfinished,
  [FinishedType.FINISHED]: taskStatusTagContent.Finished,
  [FinishedType.SHUTDOWN]: taskStatusTagContent.Shutdown,
};
</script>

<style scoped>
.gray-text {
  color: #666666;
}
.user-block {
  background-color: #f7f8fa;
}

.delayed {
  background-color: #f53f3f;
}
.finished {
  background-color: #00b42a;
}
.unfinished {
  background-color: #ff7d00;
}
.shutdown {
  background-color: #c9cdd4;
}
</style>
