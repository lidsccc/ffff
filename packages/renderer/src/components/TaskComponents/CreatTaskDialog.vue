<template>
  <el-dialog
    :model-value="props.visible"
    @update:model-value="closeDialog"
    :width="CreateDialogWidth"
    destroy-on-close
    :title="props.taskId ? '编辑任务' : '创建任务'"
  >
    <div
      class="create-task"
      :style="{ height: `${CreateDialogContentHeight}vh` }"
      v-infinite-scroll="loadList"
    >
      <el-form
        ref="formMain"
        :label-width="CreateDialogLabelWidth"
        :rules="rules"
        :model="form"
      >
        <el-form-item prop="name">
          <template #label>
            <div class="labelTemplate">
              <img src="@/assets/subject_icon.png" class="icon" />
              <span>主题:</span>
            </div>
          </template>
          <el-input v-model="form.name" placeholder="添加主题（必填）" />
        </el-form-item>
        <!-- 时间 -->
        <el-form-item prop="deadline">
          <template #label>
            <div class="labelTemplate">
              <img src="@/assets/time_icon.png" class="icon" />
              <span>时间:</span>
            </div>
          </template>
          <div class="flex">
            <div class="h-8 w-10 now-block mr-1 text-center inline-block">
              现在
            </div>
            <span class="mx-2">-</span>
            <el-date-picker
              v-model="form.deadline"
              format="YYYY-MM-DD HH:mm"
              type="datetime"
              range-separator="-"
            />
          </div>
        </el-form-item>
        <el-form-item prop="join">
          <template #label>
            <div class="labelTemplate">
              <img src="@/assets/contacts_icon.png" class="icon" />
              <span>参与人:</span>
            </div>
          </template>
          <el-input
            ref="joinInput"
            v-model="form.join"
            placeholder="添加参与人（必填）"
            @click="showContactSelect"
            @change="limitChange"
          />
          <ContactSelect
            :visible="isContactSelectVisible"
            :selected="form.userIds"
            @on-visible-change="handleContactSelectVisibleChange"
            @on-cancel="cancelContactSelect"
            @on-confirm="confirmContactSelect"
          />
        </el-form-item>
        <el-form-item v-show="!props.taskId">
          <template #label>
            <div class="labelTemplate">
              <img src="@/assets/attachment_icon.png" class="icon" />
              <span>附件:</span>
            </div>
          </template>
          <UploadFile
            :multiple="true"
            :limit="9"
            uploadButtonText="上传附件"
            :fileList="form.attachments"
            @on-remove="handleRemove"
            @on-add="handleAdd"
          />
        </el-form-item>
        <el-form-item prop="focus">
          <template #label>
            <div class="labelTemplate">
              <img src="@/assets/contacts_icon.png" class="icon" />
              <span>关注者:</span>
            </div>
          </template>
          <el-input
            v-model="focusUsers"
            placeholder="添加关注者"
            @click="isFocusContactSelectVisible = true"
          />
          <ContactSelect
            :visible="isFocusContactSelectVisible"
            :selected="form.shareUsers"
            @on-visible-change="handleFocusContactSelectVisibleChange"
            @on-cancel="cancelFocusContactSelect"
            @on-confirm="confirmFocusContactSelect"
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div class="labelTemplate">
              <img src="@/assets/desc_icon.png" class="icon" />
              <span>描述:</span>
            </div>
          </template>
          <el-input
            v-model="form.remark"
            :rows="3"
            maxlength="1000"
            show-word-limit
            type="textarea"
            placeholder="添加描述"
          />
        </el-form-item>
      </el-form>
      <div v-show="!props.taskId">
        <div v-for="item in subtask.subtaskList" :key="item.id">
          <Subtask
            @change-submit-status="changeSubmitStatus"
            @del-subtask="delSubtask"
            :index="subtask.subtaskList.indexOf(item) + 1"
            :id="item.id"
            :isSubmitting="isSubmitting"
            :subTaskDetail="item"
          />
        </div>
      </div>

      <div
        class="flex justify-end add-task px-7 cursor-pointer h-4 mt-2 mb-1"
        @click="addSubtask"
        v-show="!props.taskId"
      >
        <div class="w-4 flex align-middle">
          <img src="@/assets/add-taskIcon.png" alt="" />
        </div>
        <span class="ml-2 leading-4">新增子任务</span>
      </div>
    </div>

    <template #footer v-if="!props.taskId">
      <div class="flex justify-end mt-2">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="onValidate(formMain)">创建</el-button>
      </div>
    </template>
    <template #footer v-else>
      <div class="flex justify-end mt-2">
        <el-button @click="validateMain(formMain)">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
export default defineComponent({
  name: "CreateTaskDialog",
});
</script>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import Subtask from "@/components/TaskComponents/Subtask.vue";
import { addDays, addMinutes } from "date-fns";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { getTaskDetail, getSubTaskDetailList } from "@/api/task";
import UploadFile from "@/components/UploadFile/index.vue";
import { createTask, editMainTask } from "@/api/task";
import {
  CreateTaskParams,
  SubTaskParams,
} from "@/components/TaskComponents/type";
import type { ElForm } from "element-plus";
import { useTaskStore } from "@/store/modules/task";
import { ElMessage } from "element-plus";
import { taskDetail } from "@/components/TaskComponents/type";
import { SelectedUser } from "@/store/modules/global";
import {
  CreateDialogWidth,
  CreateDialogLabelWidth,
  CreateDialogContentHeight,
} from "@/constant/common";
type FormInstance = InstanceType<typeof ElForm>;

type Props = {
  visible: boolean;
  taskId?: string;
};
const props = defineProps<Props>();
const TaskStore = useTaskStore();
const form = reactive({
  name: "",
  attachments: [],
  userIds: [],
  shareUsers: [],
  remark: "",
  deadline: 0,
  join: "",
  focus: "",
  users: [],
});

const emits = defineEmits(["on-hide", "on-edit"]);
const closeDialog = () => {
  emits("on-hide");
};
const isContactSelectVisible = ref(false);
const joinInput = ref();
const handleContactSelectVisibleChange = (visible: boolean) => {
  isContactSelectVisible.value = visible;
  joinInput.value.blur();
};
const isFocusContactSelectVisible = ref(false);
const handleFocusContactSelectVisibleChange = (visible: boolean) => {
  isFocusContactSelectVisible.value = visible;
};
const cancelContactSelect = () => {
  isContactSelectVisible.value = false;
};

const cancelFocusContactSelect = () => {
  isFocusContactSelectVisible.value = false;
};
//选择参与者
const showContactSelect = () => {
  isContactSelectVisible.value = true;
};
const confirmContactSelect = (list: any) => {
  form.userIds = list;
  isContactSelectVisible.value = false;
  form.join = form.userIds.map((item: SelectedUser) => item.name).join(",");
};
const limitChange = () => {
  form.join = form.userIds.map((item) => item.name).join(",");
};

//选择关注者
const focusUsers = computed(() => {
  return form.shareUsers.map((item) => item.name).join(",");
});
const confirmFocusContactSelect = (list: any) => {
  form.shareUsers = list;
  isFocusContactSelectVisible.value = false;
  form.focus = form.shareUsers.map((item: SelectedUser) => item.name).join(",");
};
//截止时间默认为当前时间最近的整30分钟
const getCloseTime = () => {
  let minutes = new Date().getMinutes();
  if (minutes / 30 === 0) {
    let date = addDays(new Date(), 1).getTime();
    form.deadline = addMinutes(new Date(date), 30).getTime();
  } else {
    let n = Math.ceil(minutes / 30);
    let afterMinutes = addMinutes(new Date(), n * 30 - minutes);
    let afterDate = addDays(new Date(afterMinutes), 1);
    form.deadline = new Date(afterDate).getTime();
  }
};
getCloseTime();

//附件上传
const handleRemove = ({ url }) => {
  form.attachments = form.attachments.filter(
    (item) => item.attachmentUrl !== url
  );
};
const handleAdd = ({ name, url }) => {
  form.attachments.push({ name, attachmentUrl: url });
};

//添加子任务表
interface subTaskItem {
  id: string;
}
const subtask = reactive<{
  subtaskList: subTaskItem[];
}>({
  subtaskList: [],
});
const addSubtask = () => {
  isSubmitting.value = false;
  subtask.subtaskList.push({
    id: Date.now().toString(),
  });
};
//删除子任务表
const delSubtask = (id: number) => {
  subtask.subtaskList = subtask.subtaskList.filter((item) => item.id != id);
  isSubmitting.value = false;
};
//校验规则
const MAX_USERS = 100; //参与者最大100人
const MAX_SHARE_USERS = 50; //关注者最大50人
const rules = reactive({
  name: [
    {
      required: true,
      message: "请输入主题",
      trigger: "blur",
    },
    { max: 18, message: "主题最大为18个字符", trigger: "blur" },
  ],
  deadline: [
    {
      required: true,
      message: "请选择截止时间",
      trigger: "change",
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value < Date.now()) {
          callback(new Error("截止时间必须大于当前时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  join: [
    {
      required: true,
      message: "请选择参与人",
      trigger: "change",
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (form.userIds.length > MAX_USERS) {
          callback(new Error(`最多添加${MAX_USERS}人`));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  focus: [
    {
      required: false,
      message: "请选择关注者",
      trigger: "change",
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (form.shareUsers.length > MAX_SHARE_USERS) {
          callback(new Error(`最多添加${MAX_SHARE_USERS}人`));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});

//提交表单请求
const formMain = ref<FormInstance>();
const isSubmitting = ref(false);
const actionVos = reactive<SubTaskParams[]>([]);
const upload = (subParams?: SubTaskParams[]) => {
  const userIds: string[] = [];
  form.userIds.map((item) => {
    userIds.push(item.id);
  });
  const shareUserIds: string[] = [];
  form.shareUsers.map((item) => {
    shareUserIds.push(item.id);
  });
  form.deadline = new Date(form.deadline).getTime();
  const { name, deadline, remark, attachments } = form;

  const params: CreateTaskParams = {
    name,
    remark,
    attachments,
    deadline,
    userIds,
    shareUserIds,
    actionVos,
  };
  if (subParams) {
    params.actionVos = subParams;
  }
  createTask(params)
    .then(() => {
      ElMessage.success({ message: "创建任务成功" });
      TaskStore.refresh();
      emits("on-hide");
    })
    .catch((err) => {
      ElMessage.error({ message: `创建任务失败：${err}` });
      isSubmitting.value = false;
    });
};

//点击创建按钮开始校验
const onValidate = (formEl: FormInstance | undefined) => {
  //每次提交前都重新获得子表单数据
  actionVos.length = 0;
  formEl
    .validate()
    .then(() => {
      isSubmitting.value = true;
    })
    .catch((err) => {
      isSubmitting.value = false;
      console.log(err);
    });
};
//获得子任务表单传参
const changeSubmitStatus = (subParams?: SubTaskParams) => {
  if (subParams) {
    actionVos.push(subParams);
  } else {
    isSubmitting.value = false;
  }
};
//当点击提交且子组件全部校验成功时，上传数据
watch(
  () => [isSubmitting.value, actionVos.length],
  () => {
    if (isSubmitting.value && actionVos.length === subtask.subtaskList.length) {
      upload(actionVos);
    }
  }
);

//编辑任务时，表单数据从接口获取
if (props.taskId) {
  getTaskDetail({ id: props.taskId }).then((res: taskDetail) => {
    Object.assign(form, res);
    form.join = form.users.map((item: any) => item.user.realName).join(",");
    form.userIds = form.users.map((item: any) => {
      return {
        iconUrl: item.user.avatar,
        name: item.user.realName,
        id: item.user.userId,
      };
    });
    form.shareUsers = form.shareUsers.map((item: any) => {
      return {
        iconUrl: item.user.avatar,
        name: item.user.realName,
        id: item.user.userId,
      };
    });
  });
}
//编辑主任务时校验
const isEditing = ref(false);
const validateMain = (formEl: FormInstance | undefined) => {
  formEl
    .validate()
    .then(() => {
      isEditing.value = true;
    })
    .catch((err) => {
      isEditing.value = false;
      console.log(err);
    });
};
//主表单校验完成后调用编辑接口

watch(
  () => isEditing.value,
  () => {
    if (isEditing.value) {
      const userIds: string[] = [];
      form.userIds.map((item) => {
        userIds.push(item.id);
      });
      const shareUserIds: string[] = [];
      form.shareUsers.map((item) => {
        shareUserIds.push(item.id);
      });
      form.deadline = new Date(form.deadline).getTime();
      const { name, deadline, remark, attachments } = form;
      const params: any = {
        id: props.taskId,
        name,
        remark,
        attachments,
        deadline,
        userIds,
        shareUserIds,
      };
      editMainTask(params)
        .then(() => {
          ElMessage.success({ message: "编辑任务成功" });
          TaskStore.refresh();
          emits("on-hide");
          emits("on-edit");
        })
        .catch((err) => {
          ElMessage.error({ message: `编辑任务失败：${err}` });
          isSubmitting.value = false;
        });
    }
  }
);
//子任务详情列表
const data = reactive({
  loading: false,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  hasMore: true,
});
const fetchList = async () => {
  const { list } = data;
  data.loading = true;
  const { items = [], total } = await getSubTaskDetailList({
    taskId: props.taskId,
    pageNum: data.pageNum,
    pageSize: data.pageSize,
  });
  data.list = list.concat(items);
  subtask.subtaskList = list.concat(items);
  data.total = total;
  data.hasMore = data.list.length < total;
  data.loading = false;
};
const loadList = () => {
  if (!data.hasMore || data.loading || !props.taskId) {
    return;
  }
  fetchList();
  data.pageNum += 1;
};
</script>

<style lang="less" scoped>
.create-task {
  height: 45vh;
  overflow: auto;
  padding-right: 10px;
  .icon {
    @apply w-6 h-6;
  }
  :deep(.el-form-item__label) {
    @apply flex;
  }
  :deep(.el-range-editor) {
    @apply w-full;
  }
  .el-select {
    @apply w-full;
  }
  :deep(.el-date-editor) {
    --el-date-editor-width: 180px;
    margin-left: 4px;
  }
  :deep(.el-select) {
    margin-left: 5px;
    width: 30%;
  }
}
.add-task {
  color: var(--theme-color);
}

.now-block {
  background-color: #f7f7f7;
  border-radius: 4px;
}
.labelTemplate {
  @apply flex items-center;
  img {
    @apply mr-1;
  }
}
</style>
