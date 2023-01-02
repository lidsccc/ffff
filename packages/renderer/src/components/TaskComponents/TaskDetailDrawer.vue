<template>
  <el-drawer
    :modelValue="true"
    @update:model-value="changeVisible"
    :destroy-on-close="true"
    custom-class="task-drawer"
    direction="rtl"
    size="65%"
    modal-class="drawer-modal"
    :show-close="false"
    :append-to-body="true"
  >
    <template #header>
      <div class="flex justify-between border-b-2 pb-2 text-lg select-none">
        <div class="text-black flex items-center">
          <el-icon class="cursor-pointer mr-2" @click="changeVisible(false)"
            ><arrow-left-bold
          /></el-icon>

          <span>任务协作</span>
        </div>
        <div class="flex w-24">
          <div
            class="w-5 h-5 mr-4 cursor-pointer"
            @click="createSubtask"
            v-show="isCreator"
          >
            <el-icon :size="20"><DocumentAdd /></el-icon>
          </div>
          <img
            class="w-5 h-5 cursor-pointer mr-5"
            src="@/assets/share-task.png"
            alt=""
            @click="showContactSelectDialog"
          />
          <el-dropdown trigger="click" @command="handleCommand">
            <img
              class="w-5 h-5 cursor-pointer mr-2"
              src="@/assets/more.png"
              alt=""
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="HandleTaskType.History">
                  <img
                    src="@/assets/check-history.png"
                    class="w-5 h-5 mr-2"
                    alt=""
                  />
                  历史记录</el-dropdown-item
                >
                <el-dropdown-item
                  :command="HandleTaskType.Finish"
                  v-if="isCreator"
                >
                  <img
                    src="@/assets/finish-task.png"
                    class="w-5 h-5 mr-2"
                    alt=""
                  />
                  完成任务
                </el-dropdown-item>
                <el-dropdown-item
                  :command="HandleTaskType.Cancel"
                  v-if="isCreator"
                >
                  <img
                    src="@/assets/close-task.png"
                    class="w-5 h-5 mr-2"
                    alt=""
                  />关闭任务</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </template>
    <template #default>
      <div class="h-full" v-infinite-scroll="loadList" v-loading="data.loading">
        <MainTaskDetail
          :taskId="props.taskId"
          ref="MainTask"
          @on-get-authority="getAuthority"
        />
        <div v-if="data.list.length">
          <SubTaskDetail
            :taskDetailList="data.list"
            :isCreator="isCreator"
            @del-subtask="delSubTask"
            @get-new-subtask="getNewSubtask"
            @get-new-progress="getNewProgress"
            @filtrate-related-task="filtrateRelatedTask"
            @create-subtask="createSubtask"
            v-if="hasSubtask"
          />
        </div>
      </div>
    </template>
  </el-drawer>

  <el-dialog v-model="confirmDialogVisible" width="300px" top="30vh">
    <div class="flex flex-col justify-center items-center">
      <img src="@/assets/confirm.png" class="w-24" />
      <div class="mt-4 flex flex-col justify-center items-center">
        <div v-if="isFinish">任务完成后不可再修改，确认执行此操作</div>
        <div v-else>任务关闭后不可再修改，确认执行此操作</div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center">
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
  <HistoryDrawer
    :visible="historyDrawer"
    :taskId="props.taskId"
    @on-visible-change="historyDrawer = false"
  />
  <ContactSelect
    :visible="isContactSelectVisible"
    @on-visible-change="handleContactSelectVisible"
    @on-cancel="isContactSelectVisible = false"
    @on-confirm="confirmContactSelect"
  />
  <!-- 创建子任务 -->
  <div v-if="createSubtaskDialog">
    <el-dialog
      v-model="createSubtaskDialog"
      width="600px"
      title="新增子任务"
      destroy-on-close
    >
      <Subtask
        @on-hide="createSubtaskDialog = false"
        :createStatus="createStatus"
        @on-create-subtask="SubtaskCreate"
        @change-create-status="changeCreateStatus"
        :isCreating="true"
      />
      <template #footer>
        <div class="flex justify-end mt-2">
          <el-button @click="confirmCreateSubtask">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TaskDetailDrawer",
});
</script>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import SubTaskDetail from "@/components/TaskComponents/SubTaskDetail.vue";
import MainTaskDetail from "@/components/TaskComponents/MainTaskDetail.vue";
import ContactSelect from "@/components/ContactSelect/index.vue";
import HistoryDrawer from "@/components/TaskComponents/HistoryDrawer.vue";
import {
  getSubTaskDetailList,
  finishTask,
  cancelTask,
  addSubtask,
} from "@/api/task";
import { ElMessage } from "element-plus";
import { HandleTaskType } from "@/enums/taskStatus";
import { useTaskStore } from "@/store/modules/task";
import { SelectedUser } from "@/store/modules/global";
import { useUserStore } from "@/store/modules/user";
import { shareTask } from "@/api/task";
import { DocumentAdd } from "@element-plus/icons-vue";
import Subtask from "@/components/TaskComponents/Subtask.vue";
import { ArrowLeftBold } from "@element-plus/icons-vue";
//从store中拿到用户ID
const userStore = useUserStore();
const userId = userStore.userId;
const TaskStore = useTaskStore();

type Props = {
  taskId: string;
};
const props = defineProps<Props>();
const emitDrawer = defineEmits<{
  (event: "on-visible-change", data: boolean): void;
}>();
const changeVisible = (visible: boolean) => {
  //详情页隐藏时，清空数据
  if (!visible) {
    data.list = [];
    data.hasMore = true;
    data.loading = false;
    data.pageNum = 1;
    data.total = 0;
    data.userId = "";
  }
  emitDrawer("on-visible-change", visible);
};

// 获得任务权限
const isCreator = ref(false); // 是否为创建者
const isParticipant = ref(false); // 是否为参与者
const isFollowers = ref(false); // 是否为关注者
const getAuthority = (role: any) => {
  isCreator.value = role.isCreator;
  isParticipant.value = role.isParticipant;
  isFollowers.value = role.isFollowers;
};
//子任务详情列表
const data = reactive({
  loading: false,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  hasMore: true,
  userId: "", // 与我相关的任务
});
const fetchList = async () => {
  const { list } = data;
  data.loading = true;
  const { items = [], total } = await getSubTaskDetailList({
    taskId: props.taskId,
    pageNum: data.pageNum,
    pageSize: data.pageSize,
    userId: data.userId,
  });
  data.list = list.concat(items);
  data.total = total;
  data.hasMore = data.list.length < total;
  data.loading = false;
};
const hasSubtask = ref(false); // 判断是否有子任务
const loadList = async () => {
  if (!data.hasMore || data.loading) {
    return;
  }
  await fetchList();
  hasSubtask.value = data.list.length ? true : false;
  data.pageNum += 1;
};
//确认关闭/完成任务
const confirmDialogVisible = ref(false);
const isFinish = ref(true);
const historyDrawer = ref(false);

const handleCommand = (type: string) => {
  if (type === HandleTaskType.History) {
    historyDrawer.value = true;
  } else if (type === HandleTaskType.Finish) {
    confirmDialogVisible.value = true;
    isFinish.value = true;
  } else {
    confirmDialogVisible.value = true;
    isFinish.value = false;
  }
};
const confirm = () => {
  if (isFinish.value) {
    finishTask({ id: props.taskId })
      .then(() => {
        confirmDialogVisible.value = false;
        ElMessage.success({ message: "任务已完成！" });
        changeVisible(false);
        TaskStore.refresh();
      })
      .catch((err) => {
        ElMessage.error({ message: `操作失败：${err}` });
      });
  } else {
    cancelTask({ id: props.taskId })
      .then(() => {
        confirmDialogVisible.value = false;
        changeVisible(false);
        ElMessage.success({ message: "任务已关闭！" });
        TaskStore.refresh();
      })
      .catch((err) => {
        ElMessage.error({ message: `操作失败：${err}` });
      });
  }
};
//删除子任务
const delSubTask = (id: string) => {
  data.list = data.list.filter((item) => item.id != id);
};
//获得编辑后的列表
const getNewSubtask = async () => {
  data.list = [];
  data.pageNum = 1;
  data.total = 0;
  await fetchList();
  data.pageNum += 1;
};
// 子任务更新，主任务需更新进度
let MainTask = ref();
const getNewProgress = () => {
  MainTask.value?.getTaskDetailData();
};
// 分享任务
const isContactSelectVisible = ref(false);
const selectedUserIds = ref([]); // 选中的userId
const handleContactSelectVisible = (visible: boolean) => {
  isContactSelectVisible.value = visible;
};
const showContactSelectDialog = () => {
  isContactSelectVisible.value = true;
};
// 分享接口
const taskShare = () => {
  shareTask({
    id: props.taskId,
    users: { users: [...selectedUserIds.value] },
  })
    .then(() => {
      ElMessage.success({ message: "分享成功" });
    })
    .catch((err) => {
      ElMessage.error({ message: `分享失败：${err}` });
    });
};

const confirmContactSelect = (list: SelectedUser[]) => {
  isContactSelectVisible.value = false;
  selectedUserIds.value = list.map((item) => item.id);
  taskShare();
};

// 筛选与我相关的任务
const filtrateRelatedTask = (isRelated: boolean) => {
  data.pageNum = 1;
  data.list = [];
  data.userId = isRelated ? userId : "";
  fetchList();
};
// 新建子任务
const createSubtaskDialog = ref(false); // 创建子任务弹窗显隐
const createStatus = ref(false); // 是否校验表单并上传
const createSubtask = () => {
  createSubtaskDialog.value = true;
};
const confirmCreateSubtask = () => {
  createStatus.value = true;
};
const SubtaskCreate = (params: any) => {
  // 校验成功后创建子任务
  createStatus.value = false;
  addSubtask({ list: [params], taskId: props.taskId })
    .then(() => {
      createSubtaskDialog.value = false;
      getNewSubtask(); // 更新子任务列表
      ElMessage.success({ message: "子任务已创建！" });
    })
    .catch((err) => {
      ElMessage.error({ message: `操作失败：${err}` });
    })
    .finally(() => {
      createStatus.value = false;
    });
};
const changeCreateStatus = () => {
  createStatus.value = false;
};
</script>

<style lang="less" scoped>
.task-panel {
  width: 47%;
}
.task-panel-wrap {
  height: 90%;
}
.drawer-modal {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.08);
  cursor: default;
  box-shadow: none;
  .el-drawer__header {
    padding-right: 0;
    padding-top: 30px;
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
:deep(.el-dropdown-menu__item) {
  padding: 5px;
}
</style>
