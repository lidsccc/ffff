<template>
  <div
    v-if="messageContent.action === TaskActionType.Delay"
    class="w-[300px]"
    :class="{ bubble: props.showBubble }"
  >
    <TaskDelayMessage @on-detail-drawer-open="openTaskDetailDrawer">
      <div class="bg-white px-[12px] py-2 text-[#00b0bb] cursor-pointer">
        点击查看>>
      </div>
    </TaskDelayMessage>
  </div>

  <div
    class="w-[300px]"
    v-else
    :class="{ bubble: props.showBubble }"
    @click="openTaskDetailDrawer('')"
  >
    <div>
      <div
        class="h-[40px] px-[12px] flex items-center justify-between bg-[#00b0bb]"
      >
        <div class="text-white">通知</div>
        <div class="text-yellow-300">
          {{ ActionMap[messageContent.action] }}
        </div>
      </div>
      <div class="h-[80px] px-[12px] bg-white flex flex-col justify-center">
        <div class="flex">
          <div>任务主题</div>
          <div class="inline-block w-[220px] pl-2 truncate">
            {{ messageContent.title }}
          </div>
        </div>
        <div class="mt-1 flex">
          <div>截止时间</div>
          <div class="pl-2">
            {{ formatTime(get(messageContent, "data[0].deadline")) }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="drawerVisible">
    <TaskDetailDrawer :taskId="taskId" @on-visible-change="changeVisible" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TaskMessage",
});
</script>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { get } from "lodash-es";
import { Message } from "@/types/message";
import { formatTime } from "@/utils/time";
import { TaskActionType } from "@/enums/taskStatus";
import TaskDetailDrawer from "@/components/TaskComponents/TaskDetailDrawer.vue";
import TaskDelayMessage from "@/components/MessageType/TaskDelayMessage.vue";
interface Props {
  detail: Message;
  showBubble?: boolean;
}

const ActionMap = {
  0: "派发",
  1: "关闭",
  2: "催办",
  3: "完成",
  4: "更新",
  5: "逾期",
  6: "滞后",
  7: "关注",
};

const props = withDefaults(defineProps<Props>(), { showBubble: true });

const messageContent = computed(() => {
  try {
    const content = JSON.parse(props.detail.content);
    if (!content.data) return {};
    return JSON.parse(content.data);
  } catch (err: any) {
    window.$log.error("任务消息", err);
    return {};
  }
});

const drawerVisible = ref(false);
const taskId = ref("");
const openTaskDetailDrawer = (id?: string) => {
  drawerVisible.value = true;
  taskId.value = id ? id : get(messageContent.value, "data[0].id");
};
const changeVisible = (visible: boolean) => {
  drawerVisible.value = visible;
};
</script>

<style lang="less" scoped>
.bubble {
  border-radius: 3px 10px 10px 12px;
  overflow: hidden;
}

.bubble-left {
  border-radius: 3px 10px 10px 12px;
}
.bubble-right {
  border-radius: 10px 3px 12px 10px;
}

.bg-primary {
  background: var(--theme-color);
}
</style>
<style lang="less">
.task-drawer {
  box-shadow: none;
  border-left: 1px solid #e5e7eb;
}
.drawer-modal {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.08);
  cursor: default;
  box-shadow: none;
  .el-drawer__header {
    padding-right: 0;
    padding-top: 22px;
    margin-bottom: 0;
  }
  .el-drawer__body {
    padding: 0;
  }
  .task-drawer {
    box-shadow: none;
    border-left: 1px solid #e5e7eb;
  }
}
.history-modal {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.08);
  cursor: default;
  box-shadow: none;
  .el-drawer__header {
    padding-right: 0;
    padding-top: 22px;
    margin-bottom: 0;
  }
  .el-drawer__body {
    padding: 0;
  }
  .history-drawer {
    box-shadow: none;
    border-left: 1px solid #e5e7eb;
    .date {
      font-size: 14px;
      color: var(--theme-text-gray);
    }
  }
}
</style>
