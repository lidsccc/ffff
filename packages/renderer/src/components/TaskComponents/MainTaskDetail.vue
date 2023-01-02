<template>
  <div v-loading="loading" class="p-4">
    <div class="flex justify-between" style="height: 30px">
      <div class="flex items-center">
        <div class="side-block"></div>
        <span class="font-bold mr-4">基本信息</span>
        <el-icon
          class="cursor-pointer"
          @click="CreatedialogVisible = true"
          v-show="!isFinished && isCreator"
          ><Edit
        /></el-icon>
      </div>
    </div>
    <!-- 基本信息 -->
    <div class="pl-2">
      <div
        class="py-2 cursor-text text-base font-semibold"
        v-if="!taskNameEditable"
        @click="showNameInput"
      >
        {{ taskDetail.name }}
      </div>
      <el-input
        v-model="taskName"
        ref="RefNameInput"
        :placeholder="taskDetail.name"
        @focus="taskName = taskDetail.name"
        @blur="editTaskName"
        @keyup.enter="($event:any) => $event.target.blur()"
        v-else
      />
      <div class="flex items-center py-2">
        <div>创建者：</div>
        <div
          class="user-block cursor-pointer w-18 px-2 rounded-full items-center flex py-1"
          @click="showUserDetail(taskDetail.creatorVo.userId)"
        >
          <UserAvatar
            :size="26"
            :src="get(taskDetail, 'creatorVo.avatar')"
            :name="get(taskDetail, 'creatorVo.realName[0]')"
            :id="get(taskDetail, 'creatorVo.userId')"
          >
            <span>{{ get(taskDetail, "creatorVo.realName[0]") }}</span>
          </UserAvatar>
          <div class="ml-1 text-sm name-block">
            {{ get(taskDetail, "creatorVo.realName") }}
          </div>
        </div>
      </div>
      <div class="pb-2">
        <UserCollapse
          :userList="taskDetail.users"
          @on-user-edit="editUsers(taskDetail.users, true)"
          :editable="!isFinished && isCreator"
        />
      </div>
      <div
        class="mb-4 text-xs flex items-center cursor-pointer"
        v-if="!datePickerVisible"
        @click="showdeadlineInput"
      >
        <TaskStatusTag :taskStatus="taskDetail.status" />
        <span class="mx-2">{{ format(taskDetail?.deadline, "MM月dd日") }}</span
        ><span class="mr-2"> {{ format(taskDetail?.deadline, "HH:mm") }}</span>
        <span>截止</span>
      </div>
      <el-date-picker
        v-else
        ref="Refdeadline"
        v-model="newDeadline"
        format="YYYY-MM-DD HH:mm"
        type="datetime"
        range-separator="-"
        placeholder="点击选择截止时间"
        :clearable="false"
        @change="editDeadline"
        @blur="cancelEditDeadline"
      />
      <div class="w-1/2 relative pt-1 h-8">
        <span>总进度：</span>

        <el-progress
          :percentage="taskDetail.progress ? taskDetail.progress : 0"
        />
      </div>
      <div>
        <div class="" v-show="shareUsers?.length">
          <UserCollapse
            :userList="shareUsers"
            :title="'关注者'"
            :editable="!isFinished && isCreator"
            @on-user-edit="editUsers(shareUsers, false)"
          />
        </div>
      </div>
    </div>
    <!-- 描述 -->
    <div v-show="taskDetail?.remark?.length">
      <div class="flex mb-4 items-center">
        <div class="side-block"></div>
        <div class="leading-7 mr-3 font-bold">描述</div>
        <el-icon
          class="cursor-pointer"
          @click="showRemarkInput"
          v-show="!isFinished && isCreator"
          ><Edit
        /></el-icon>
      </div>
      <div
        class="bg-gray-100 px-2 py-1 w-5/6 rounded"
        v-if="!taskRemarkEditable"
      >
        <span class="overflow-ellipsis break-all">
          {{ taskDetail?.remark }}</span
        >
      </div>

      <div v-else>
        <el-input
          v-model="taskRemark"
          ref="RefRemarkInput"
          :placeholder="taskDetail?.remark"
          @focus="taskRemark = taskDetail?.remark"
        />
        <div class="flex justify-start mt-2">
          <el-button type="primary" @click="editRemarkName">确定</el-button>
          <el-button @click="taskRemarkEditable = false">取消</el-button>
        </div>
      </div>
    </div>
    <!-- 附件 -->
    <div class="flex my-4 items-center">
      <div class="side-block"></div>
      <div class="leading-7 mr-3 font-bold">附件</div>
      <UploadFile
        :multiple="false"
        :limit="9"
        @on-before-upload="beforeUpload"
        @on-add="uploadSucceeded"
        v-show="!isFinished && (isCreator || isParticipant)"
      >
        <el-icon class="cursor-pointer"><Plus /></el-icon
      ></UploadFile>
    </div>
    <div v-show="taskDetail.attachments?.length">
      <div class="flex w-full flex-wrap">
        <div
          v-for="item in taskDetail.attachments"
          :key="item.id"
          class="mb-4 mr-4"
        >
          <DownloadFile
            :attachments="item"
            :deleteAble="!isFinished && (isCreator || isParticipant)"
            @on-download="handleFileDownload"
            @on-delete="handleFileDelete"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- 编辑任务 -->
  <div v-if="CreatedialogVisible">
    <CreatTaskDialog
      :visible="CreatedialogVisible"
      :taskId="props.taskId"
      @on-hide="CreatedialogVisible = false"
      @on-edit="getTaskDetailData"
    />
  </div>
  <!-- 确认删除文件对话框 -->
  <el-dialog v-model="deleteDialogVisible" width="300px" top="30vh">
    <div class="flex flex-col justify-center items-center">
      <img src="@/assets/confirm.png" class="w-24" />
      <div class="mt-4 flex flex-col justify-center items-center">
        <div>确认删除当前附件？</div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDelete">确定</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 选人组件 -->
  <ContactSelect
    :visible="ContactSelectVisible"
    @on-visible-change="changeContactSelectVisible"
    @on-confirm="confirmChangUsers"
    @on-cancel="ContactSelectVisible = false"
    :selected="selectedUsers"
  />
  <!-- 人员详情弹窗 -->
  <el-dialog v-model="detailDialogVisible" width="400px" destroy-on-close>
    <UserDetail :id="selectedUserId" />
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  name: "MainTaskDetail",
});
</script>

<script lang="ts" setup>
import { ref, computed, nextTick } from "vue";
import { format } from "date-fns";
import {
  getTaskDetail,
  editMainTaskFile,
  editMainTaskInfo,
  editMainTaskParticipants,
} from "@/api/task";
import { taskDetailData } from "@/components/TaskComponents/type";
import CreatTaskDialog from "@/components/TaskComponents/CreatTaskDialog.vue";
import DownloadFile from "@/components/DownLoadFile/index.vue";
import { useTaskStore } from "@/store/modules/task";
import { FinishedType } from "@/enums/taskStatus";
import { useUserStore } from "@/store/modules/user";
import { Edit, Plus } from "@element-plus/icons-vue";
import UserCollapse from "@/components/TaskComponents/UserCollapse/index.vue";
import TaskStatusTag from "@/components/TaskComponents/TaskStatusTag.vue";
import UploadFile from "@/components/UploadFile/index.vue";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { SelectedUser } from "@/store/modules/global";
import { ElMessage } from "element-plus";
import UserDetail from "@/components/UserDetail/index.vue";
import { get } from "lodash-es";
import { FILE_DOWNLOAD } from "@/../../main/channel";
import UserAvatar from "@/components/UserAvatar/index.vue";
const TaskStore = useTaskStore();
const userStore = useUserStore();

type Props = {
  taskId: string;
};
const props = defineProps<Props>();
//详情下拉菜单显隐

const taskData: taskDetailData = reactive({
  taskDetail: {
    attachments: [],
    closeTime: 0,
    createGroup: 0,
    createTime: 0,
    creator: "",
    creatorVo: {},
    deadline: 0,
    finishTime: 0,
    gourpId: "",
    id: "",
    moreInfo: "",
    name: "",
    progress: 0,
    remark: "",
    shareUsers: [],
    status: 0,
    updateTime: 0,
    users: [],
  },
});
const loading = ref(true);
const isFinished = ref(true); // 任务是否已完成
const isCreator = ref(false); // 是否为创建者
const isParticipant = ref(false); // 是否为参与者
const isFollowers = ref(false); // 是否为关注者
const emits = defineEmits(["on-get-authority"]);
const getTaskDetailData = () => {
  getTaskDetail({ id: props.taskId }).then((res) => {
    taskData.taskDetail = res;
    loading.value = false;
    isFinished.value = TaskStore.taskType === FinishedType.ALL;
    isCreator.value = userStore.userId === res.creator;
    isParticipant.value = res.users
      .map((item: any) => item.userId)
      .some((item: string) => item === userStore.userId);

    isFollowers.value = res.shareUsers
      .map((item: any) => item.userId)
      .some((item: string) => item === userStore.userId);
    emits("on-get-authority", {
      //将任务权限暴露给外部
      isCreator: isCreator.value,
      isParticipant: isParticipant.value,
      isFollowers: isFollowers.value,
    });
    //当前账号不为任务创建者或任务已完成时不可编辑
  });
};
getTaskDetailData();
const taskDetail = computed(() => {
  return taskData.taskDetail;
});
const shareUsers = computed(() => {
  return taskData.taskDetail.shareUsers;
});
// 编辑任务弹窗
const CreatedialogVisible = ref(false);

defineExpose({ getTaskDetailData });

// 下载附件
const handleFileDownload = (fileDetail: any) => {
  ipcRenderer.send(FILE_DOWNLOAD, {
    downloadPath: fileDetail.attachmentUrl, // 下载链接
    fileName: fileDetail.name, // 下载文件名
  });
};
// 删除附件
const deleteDialogVisible = ref(false);
const uploadFileList = ref(); // 编辑后的文件列表
const handleFileDelete = (fileDetail: any) => {
  deleteDialogVisible.value = true;
  uploadFileList.value = taskDetail.value.attachments?.filter((item: any) => {
    return item.attachmentUrl !== fileDetail.attachmentUrl;
  });
};
const confirmDelete = () => {
  editMainTaskFile({
    id: taskDetail.value.id,
    attachments: { attachments: uploadFileList.value },
  })
    .then(() => {
      ElMessage.success({ message: "删除成功" });
      deleteDialogVisible.value = false;
      taskData.taskDetail.attachments = uploadFileList.value;
    })
    .catch((err) => {
      ElMessage.error({ message: `删除失败：${err}` });
    });
};
//上传附件
const beforeUpload = (file: any) => {
  taskData.taskDetail.attachments?.push({
    createTime: file.uid,
    name: file.name,
    loading: true,
  });
};
// 上传至文件服务器后
const uploadSucceeded = (file: any) => {
  // 给新文件添加文件url
  taskData.taskDetail.attachments?.splice(
    taskData.taskDetail.attachments.length - 1,
    1,
    { attachmentUrl: file.url, name: file.name }
  );
  // 走接口添加任务附件
  editMainTaskFile({
    id: taskDetail.value.id,
    attachments: { attachments: taskData.taskDetail.attachments || [] },
  })
    .then(() => {
      ElMessage.success({ message: "添加成功" });
      taskData.taskDetail.attachments?.map((item) => (item.loading = false));
    })
    .catch((err) => {
      ElMessage.error({ message: `添加失败：${err}` });
      taskData.taskDetail.attachments?.pop();
    });
};
// 编辑主任务的基础信息

// 编辑任务名
const taskName = ref("");
const taskNameEditable = ref(false);
const RefNameInput = ref();
const showNameInput = () => {
  if (!isFinished.value && isCreator.value) {
    taskNameEditable.value = true;
    nextTick(() => {
      RefNameInput.value.focus(); // 手动获得焦点
    });
  }
};
const editTaskName = () => {
  // 回车或blur后提交
  if (taskName.value.length < 1 || taskName.value.length > 18) {
    ElMessage.error({ message: "任务名必填且不超过18个字符" });
  } else if (taskName.value === taskData.taskDetail.name) {
    // 没有变化时不走接口
    taskNameEditable.value = false;
  } else {
    editMainTaskInfo({ id: taskData.taskDetail.id, name: taskName.value })
      .then(() => {
        ElMessage.success({ message: "修改成功" });
        taskData.taskDetail.name = taskName.value;
      })
      .catch((err) => {
        ElMessage.error({ message: `修改失败：${err}` });
      })
      .finally(() => {
        taskNameEditable.value = false;
      });
  }
};

// 编辑描述
const taskRemark = ref("");
const taskRemarkEditable = ref(false);
const RefRemarkInput = ref();
const showRemarkInput = () => {
  taskRemarkEditable.value = true;
  nextTick(() => {
    RefRemarkInput.value.focus(); // 手动获得焦点
  });
};
const editRemarkName = () => {
  // 回车或blur后提交
  if (taskRemark.value === taskData.taskDetail.remark) {
    // 没有变化时不走接口
    taskRemarkEditable.value = false;
  } else {
    editMainTaskInfo({
      id: taskData.taskDetail.id,
      remark: taskRemark.value,
    })
      .then(() => {
        ElMessage.success({ message: "修改成功" });
        taskData.taskDetail.remark = taskRemark.value;
      })
      .catch((err) => {
        ElMessage.error({ message: `修改失败：${err}` });
      })
      .finally(() => {
        taskRemarkEditable.value = false;
      });
  }
};
// 编辑主任务参与者与关注者
const ContactSelectVisible = ref(false);
const changeContactSelectVisible = (visible: boolean) => {
  ContactSelectVisible.value = visible;
}; // 控制选人组件显隐
const selectedUsers = ref([]); // 编辑前就有的人员
const isUsersEditing = ref(true); // 是否正在编辑参与者

const editUsers = (users: any, isEditingUsers: boolean) => {
  ContactSelectVisible.value = true;
  selectedUsers.value = users.map((item: any) => {
    return {
      id: item.user.userId,
      name: item.user.realName,
      iconUrl: item.user.avatar,
    };
  });
  isUsersEditing.value = isEditingUsers;
};
const confirmChangUsers = (userList: SelectedUser[]) => {
  const params = {
    id: taskData.taskDetail.id,
    userIds: [],
    shareUserIds: [],
  };

  params.userIds = isUsersEditing.value
    ? userList.map((item: any) => item.id)
    : taskData.taskDetail.users?.map((item: any) => item.user.userId);
  params.shareUserIds = isUsersEditing.value
    ? taskData.taskDetail.shareUsers?.map((item: any) => item.user.userId)
    : userList.map((item: any) => item.id);
  editMainTaskParticipants(params)
    .then(() => {
      ElMessage.success({ message: "修改成功" });
      getTaskDetailData();
      TaskStore.refresh(); // 修改参与者后刷新任务列表
    })
    .catch((err) => {
      ElMessage.error({ message: `修改失败：${err}` });
    })
    .finally(() => {
      ContactSelectVisible.value = false;
    });
};
// 编辑截止时间
const newDeadline = ref("");
const datePickerVisible = ref(false);
const Refdeadline = ref();
const showdeadlineInput = () => {
  if (!isFinished.value && isCreator.value) {
    datePickerVisible.value = true;

    nextTick(() => {
      Refdeadline.value.focus(); // 手动获得焦点
    });
  }
};
const editDeadline = (newDeadline: Date) => {
  if (newDeadline.getTime() < Date.now()) {
    datePickerVisible.value = false;
    ElMessage.error({ message: "截至时间需大于当前时间" });
  } else {
    editMainTaskInfo({
      id: taskData.taskDetail.id,
      deadline: newDeadline.getTime().toString(),
    })
      .then(() => {
        ElMessage.success({ message: "修改成功" });
        taskData.taskDetail.deadline = newDeadline.getTime();
        TaskStore.refresh();
      })
      .catch((err) => {
        ElMessage.error({ message: `修改失败：${err}` });
      })
      .finally(() => {
        datePickerVisible.value = false;
      });
  }
};
const cancelEditDeadline = () => {
  datePickerVisible.value = false;
};
// 点击创建者头像打开详情人员详情
const detailDialogVisible = ref(false);
const selectedUserId = ref("");
const showUserDetail = (id: string) => {
  selectedUserId.value = id;
  detailDialogVisible.value = true;
};
</script>

<style lang="less" scoped>
:deep(.el-progress) {
  left: 62px;
  top: -17px;
}

.file-name {
  max-width: 5rem;
}
.user-block {
  background-color: #f7f8fa;
}
.side-block {
  width: 2px;
  height: 18px;
  background-color: var(--theme-color);
  margin-right: 5px;
}
:deep(.el-upload) {
  padding-top: 3px;
}
:deep(.el-upload-list) {
  display: none;
}
</style>
