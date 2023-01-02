<template>
  <div class="flex justify-between mb-4">
    <div class="font-bold">{{ taskDetail.name }}</div>
    <div class="flex justify-between">
      <div
        @click="show = true"
        class="cursor-pointer pr-4 select-none"
        v-if="!show"
      >
        详情>>
      </div>
      <div v-else class="flex w-12 justify-end items-center">
        <img
          class="w-4 h-4 cursor-pointer mr-4"
          src="@/assets/edit-task.png"
          alt=""
          @click="EditdialogVisible = true"
          v-show="editable"
        />
        <img
          @click="show = false"
          src="@/assets/pull-up.png"
          alt=""
          class="w-3.5 h-3.5 cursor-pointer box-content mr-4"
        />
      </div>

      <img
        src="@/assets/delete-icon.png"
        alt=""
        class="w-3.5 h-3.5 cursor-pointer pt-1 box-content"
        @click="changeDelDialog"
      />
    </div>
  </div>
  <div class="py-4">
    <div class="flex justify-between w-full">
      <div class="w-1/2 flex items-center mb-4">
        <div class="mr-4">{{ taskProgress }}%</div>
        <el-slider
          v-model="taskProgress"
          :show-tooltip="false"
          @change="editProgress"
          :disabled="!editable"
        />
      </div>
      <div class="flex" v-if="editDetailVisible">
        <el-button class="mr-2" size="small" text @click="cancelEdit"
          >取消</el-button
        >
        <el-button class="" text size="small" @click="confirmEditProgress"
          >保存</el-button
        >
      </div>
      <!-- <el-button
        text
        size="small"
        v-else
        @click="editDetailVisible = true"
        v-show="editable"
        >编辑</el-button
      > -->
    </div>
    <div class="text-xs flex items-center">
      <div class="mr-2">
        {{ format(taskDetail.deadline, "yyyy年MM月dd日 HH:mm截止") }}
      </div>

      <el-tooltip
        content="全部催办"
        popper-class="popper-box"
        placement="top-start"
        :hide-after="100"
      >
        <div class="cursor-pointer pt-1">
          <el-icon :size="20" class="" @click="urgeAll"><Clock /></el-icon>
        </div>
      </el-tooltip>
    </div>

    <!-- <el-input
      v-model="editDescribe"
      placeholder="请输入执行情况"
      v-show="editDetailVisible"
    /> -->
  </div>

  <div v-if="show">
    <UserCollapse :userList="props.taskDetail.users" :canBeUrged="true" />

    <div v-for="item in taskDetail.attachments" :key="item.id" class="mb-4">
      <DownloadFile :attachments="item" />
    </div>
  </div>
  <el-dialog v-model="confirmDialogVisible" width="300px" top="30vh">
    <div class="flex flex-col justify-centecancelDelr items-center">
      <img src="@/assets/confirm.png" class="w-24" />
      <div class="mt-4 flex flex-col justify-center items-center">
        <div>子任务将在列表中删除，确认执行此操作</div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center">
        <el-button @click="cancelDel">取消</el-button>
        <el-button type="primary" @click="confirmDelete(taskDetail.id)"
          >确定</el-button
        >
      </div>
    </template>
  </el-dialog>
  <div v-if="EditdialogVisible">
    <el-dialog
      :model-value="EditdialogVisible"
      @update:model-value="EditdialogVisible = false"
      width="600px"
      title="编辑子任务"
      destroy-on-close
    >
      <Subtask
        :id="taskDetail.id"
        :subTaskDetail="taskDetail"
        :isEditing="true"
        :editStatus="editStatus"
        @change-edit-status="editStatus = false"
        @on-hide="EditdialogVisible = false"
        @get-new-subtask="getNewSubtask"
      />
      <template #footer>
        <div class="flex justify-end mt-2">
          <el-button @click="editSubTaskDetail">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SubTaskPanel",
});
</script>

<script lang="ts" setup>
import { ref, computed, toRef } from "vue";
import { subTaskDeatil } from "@/components/TaskComponents/type";
import { delSubTask, editSubTask } from "@/api/task";
import { ElMessage } from "element-plus";
import Subtask from "@/components/TaskComponents/SubTask.vue";
import { useUserStore } from "@/store/modules/user";
import { useTaskStore } from "@/store/modules/task";
import DownloadFile from "@/components/DownLoadFile/index.vue";
import UserCollapse from "@/components/TaskComponents/UserCollapse/index.vue";
import { FinishedType } from "@/enums/taskStatus";
import { format } from "date-fns";
import { Clock } from "@element-plus/icons-vue";
import { subtaskUrgeAll } from "@/api/task";
const TaskStore = useTaskStore();
type Props = {
  taskDetail: subTaskDeatil;
};

const props = defineProps<Props>();
const show = ref(false);

const taskDetail = computed(() => {
  return props.taskDetail;
});
//删除子任务
const emits = defineEmits([
  "del-subtask",
  "get-new-subtask",
  "get-new-progress",
]);

const confirmDialogVisible = ref(false);

const changeDelDialog = () => {
  confirmDialogVisible.value = true;
};
const confirmDelete = (id: string) => {
  delSubTask({ id })
    .then(() => {
      confirmDialogVisible.value = false;
      emits("del-subtask", id);
      ElMessage.success({ message: "删除成功" });
    })
    .catch((err) => {
      ElMessage.error({ message: `删除失败：${err}` });
    });
};
//编辑任务弹窗
const EditdialogVisible = ref(false);
const editStatus = ref(false);
const editSubTaskDetail = () => {
  editStatus.value = true;
};
const getNewSubtask = () => {
  emits("get-new-subtask");
};
//从store中拿到用户ID
const userStore = useUserStore();
const userId = userStore.userId;
const creator = taskDetail.value.creator;
//子任务参与者与主任务创建者可编辑
const editable = ref(false);
taskDetail.value.users?.map((item) => {
  if (item.userId === userId || creator === userId) {
    editable.value = true;
  }
});

//已完成任务不可编辑
if (TaskStore.taskType == FinishedType.ALL) {
  editable.value = false;
}

//修改任务进度
const taskProgress = ref();
const propTaskDetail = toRef(props, "taskDetail");
taskProgress.value = propTaskDetail.value.progress;
const editDescribe = ref(""); // TODO: 添加进度描述,需后端支持
const editDetailVisible = ref(false);
const editProgress = () => {
  editDetailVisible.value = true;
};
const confirmEditProgress = () => {
  const params = props.taskDetail;
  params.userIds = [];
  params.progress = taskProgress.value;
  props.taskDetail.users.map((item) => {
    params.userIds.push(item.userId);
  });
  editSubTask(params)
    .then(() => {
      ElMessage.success({ message: "进度修改成功" });
      TaskStore.refresh();
      emits("get-new-progress"); //子任务进度修改，需重新获得主任务进度
      editDetailVisible.value = false;
      editDescribe.value = "";
    })
    .catch((err) => {
      ElMessage.error({ message: `进度修改失败：${err}` });
      taskProgress.value = props.taskDetail.progress;
    });
};

// 取消删除
const cancelDel = () => {
  taskProgress.value = propTaskDetail.value.progress;
  confirmDialogVisible.value = false;
};
// 取消进度编辑
const cancelEdit = () => {
  editDetailVisible.value = false;
  taskProgress.value = propTaskDetail.value.progress;
  editDescribe.value = "";
};
// 催办全部
const urgeAll = () => {
  subtaskUrgeAll({ id: props.taskDetail.id })
    .then(() => {
      ElMessage.success({ message: "已催办全部成员！" });
    })
    .catch((err) => {
      ElMessage.error({ message: `操作失败：${err}` });
    });
};
</script>

<style>
.popper-box {
  padding: 0 5px;
}
</style>
<style lang="less" scoped>
:deep(.el-progress__text) {
  position: absolute;
  left: -44px;
  font-size: 0.875rem !important;
}

.task-split {
  background: #f1f2f3;
}
.file-name {
  max-width: 5rem;
}
:deep(.el-dialog__body) {
  overflow: auto;
  padding-top: 0;
}
.users-wrap {
  min-width: calc(100% - 2.5rem);
}
</style>
