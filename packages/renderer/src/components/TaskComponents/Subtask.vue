<template>
  <div
    class="mt-2 py-2"
    :class="props.isEditing || props.isCreating ? ' ' : 'px-7 sub-title'"
  >
    <div v-if="!(props.isEditing || props.isCreating)">
      <div class="flex justify-between pb-2 pt-2">
        子任务{{ props.index }}
        <img
          class="h-4 cursor-pointer"
          src="@/assets/delete-icon.png"
          alt=""
          @click="delSubtask"
        />
      </div>
    </div>
    <el-form
      :label-width="CreateDialogLabelWidth"
      :class="
        props.isEditing || props.isCreating ? ' schedule-form' : 'create-form'
      "
      :rules="rules"
      :model="form"
      ref="formSub"
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
      <el-form-item prop="join">
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/contacts_icon.png" class="icon" />
            <span>参与人:</span>
          </div>
        </template>
        <el-input
          v-model="form.join"
          placeholder="添加参与人（必填）"
          @click="isContactSelectVisible = true"
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

      <el-form-item>
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
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CreateTaskDialog",
});
</script>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from "vue";
import { addDays, addMinutes } from "date-fns";
import type { ElForm } from "element-plus";
import { CreateTaskParams } from "@/components/TaskComponents/type";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { usersList } from "@/store/modules/task";
import UploadFile from "@/components/UploadFile/index.vue";
import { editSubTask } from "@/api/task";
import { ElMessage } from "element-plus";
import { CreateDialogLabelWidth } from "@/constant/common";
type FormInstance = InstanceType<typeof ElForm>;

type Props = {
  index?: number;
  id?: string;
  isSubmitting?: boolean;
  subTaskDetail?: any;
  isEditing?: boolean; // 是否为编辑子任务
  editStatus?: boolean; // 为true时校验表单并走编辑接口
  isCreating?: boolean; // 是否为单独创建子任务
  createStatus?: boolean; // 为true时校验表单并走创建接口
};
const props = defineProps<Props>();
const form = reactive({
  name: "",
  attachments: [],
  userIds: [],
  remark: "",
  deadline: 0,
  join: "",
});

const isContactSelectVisible = ref(false);
const handleContactSelectVisibleChange = (visible: boolean) => {
  isContactSelectVisible.value = visible;
};
const cancelContactSelect = () => {
  isContactSelectVisible.value = false;
};

//选择参与者
const confirmContactSelect = (list: usersList) => {
  form.userIds = list;
  isContactSelectVisible.value = false;
  form.join = form.userIds.map((item) => item.name).join(",");
};
const limitChange = () => {
  form.join = form.userIds.map((item) => item.name).join(",");
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

const handleRemove = ({ url }) => {
  form.attachments = form.attachments.filter(
    (item) => item.attachmentUrl !== url
  );
};
const handleAdd = ({ name, url }) => {
  form.attachments.push({ name, attachmentUrl: url });
};

//删除子任务表
const emitsSubtask = defineEmits([
  "del-subtask",
  "on-hide",
  "change-submit-status",
  "change-edit-status",
  "get-new-subtask",
  "on-create-subtask",
  "change-create-status",
]);

const delSubtask = () => {
  emitsSubtask("del-subtask", props.id);
};
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
        if (form.userIds.length > 50) {
          callback(new Error("最多添加50人"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});
const formSub = ref<FormInstance>();

const validateForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl
    .validate()
    .then((valid) => {
      form.deadline = new Date(form.deadline).getTime();
      const { name, deadline, attachments } = form;
      const userIds: string[] = [];
      form.userIds.map((item) => {
        userIds.push(item.id);
      });
      const params: CreateTaskParams = {
        name,
        attachments,
        deadline,
        userIds,
        id: subTaskDetail.value?.id || "",
      };
      if (!props.isEditing) {
        emitsSubtask("change-submit-status", params);
      } else if (props.editStatus) {
        editSubTask(params)
          .then(() => {
            ElMessage.success({ message: "编辑子任务成功" });
            emitsSubtask("on-hide");
            emitsSubtask("get-new-subtask");
          })
          .catch((err) => {
            ElMessage.error({ message: `编辑子任务失败：${err}` });
          });
      }
      if (props.isCreating) {
        emitsSubtask("on-create-subtask", params);
      }
    })
    .catch((err) => {
      emitsSubtask("change-submit-status");
      emitsSubtask("change-edit-status");
      emitsSubtask("change-create-status");
    });
};

watch(
  () => [props.isSubmitting, props.editStatus, props.createStatus],
  () => {
    if (props.isSubmitting) {
      validateForm(formSub.value);
    }
    if (props.editStatus) {
      validateForm(formSub.value);
    }
    if (props.createStatus) {
      validateForm(formSub.value);
    }
  }
);
const subTaskDetail = computed(() => {
  return props.subTaskDetail;
});
//编辑
if (props.isEditing) {
  form.name = subTaskDetail.value.name;
  form.userIds = subTaskDetail.value.users.map((item: any) => {
    return {
      iconUrl: item.user.avatar,
      name: item.user.realName,
      id: item.user.userId,
    };
  });
  form.join = form.userIds.map((item) => item.name).join(",");
  form.deadline = subTaskDetail.value.deadline;
  form.attachments = subTaskDetail.value.attachments
    ? subTaskDetail.value.attachments
    : [];
}
</script>

<style lang="less" scoped>
.create-form {
  background-color: #f7f7f7;
  padding-right: 10px;
  .icon {
    @apply w-6 h-6;
  }
  :deep(.el-form-item__label) {
    @apply flex mt-1;
  }
  :deep(.el-range-editor) {
    @apply w-full;
  }
  .el-select {
    @apply w-full;
  }
  :deep(.el-date-editor) {
    --el-date-editor-width: 180px;
  }
  :deep(.el-select) {
    margin-left: 5px;
    width: 30%;
  }
}
.schedule-form {
  padding-right: 10px;
  .icon {
    @apply w-6 h-6;
  }
  :deep(.el-form-item__label) {
    @apply flex mt-1;
  }
  :deep(.el-range-editor) {
    @apply w-full;
  }
  .el-select {
    @apply w-full;
  }
  :deep(.el-date-editor) {
    --el-date-editor-width: 180px;
  }
  :deep(.el-select) {
    margin-left: 5px;
    width: 30%;
  }
}
.add-task {
  color: var(--theme-color);
}
.sub-title {
  background-color: #f7f7f7;
}
.now-block {
  background-color: rgb(235, 236, 238);
  border-radius: 4px;
}
.edit-wrap {
  padding-right: 0;
  padding-left: 0;
}
.labelTemplate {
  @apply flex items-center;
  img {
    @apply mr-1;
  }
}
</style>
