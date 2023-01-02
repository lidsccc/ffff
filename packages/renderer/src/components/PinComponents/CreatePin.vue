<template>
  <div class="button-wrap">
    <el-button
      :icon="Plus"
      @click="CreatePinDialogVisible = true"
      v-show="canCreatePin"
      >创建通知</el-button
    >
  </div>
  <div>
    <el-dialog
      v-model="CreatePinDialogVisible"
      title="创建Pin"
      destroy-on-close
      :width="CreateDialogWidth"
    >
      <div
        class="creat-pin-dialog"
        :style="{ height: `${CreateDialogContentHeight}vh` }"
      >
        <el-tabs class="demo-tabs" v-model="noticeType">
          <el-tab-pane
            :label="item.label"
            :name="item.value"
            :key="item.value"
            v-for="item in noticeTypeOptions"
          />
        </el-tabs>
        <el-form
          ref="formRef"
          :label-width="CreateDialogLabelWidth"
          class="create-form"
          :rules="rules"
          :model="createPinForm"
        >
          <el-form-item prop="content">
            <template #label>
              <div class="labelTemplate">
                <img src="@/assets/pin-content.png" class="icon" />
                <span>内容:</span>
              </div>
            </template>
            <el-input
              v-model="createPinForm.content"
              placeholder="添加pin消息内容（必填）"
              :rows="3"
              type="textarea"
            />
          </el-form-item>
          <!-- 附件 -->
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
              :fileList="createPinForm.attachments"
              @on-remove="handleRemove"
              @on-add="handleAdd"
            />
          </el-form-item>
          <!-- 接收人 -->
          <el-form-item prop="recipient">
            <template #label>
              <div class="labelTemplate">
                <img src="@/assets/pin-recept.png" class="icon" />
                <span>接收人:</span>
              </div>
            </template>
            <el-input
              v-model="createPinForm.recipient"
              placeholder="添加接收者（必填）"
              @click="isReceptSelectVisible = true"
              @change="limitChange"
              ref="receptInput"
            />
            <ContactSelect
              :visible="isReceptSelectVisible"
              :selected="createPinForm.userIds || []"
              @on-visible-change="handleReceptContactSelectVisible"
              @on-cancel="cancelReceptContactSelect"
              @on-confirm="confirmReceptContactSelect"
            />
          </el-form-item>
          <!-- 定时发送 -->
          <el-row>
            <el-col :span="hasSendTime ? 14 : 24">
              <el-form-item>
                <template #label>
                  <div class="labelTemplate">
                    <img src="@/assets/pin-settime.png" class="icon" />
                    <span>发送:</span>
                  </div>
                </template>
                <el-select
                  v-model="hasSendTime"
                  placeholder="立即发送"
                  @change="handleSendTime"
                >
                  <el-option
                    v-for="item in timeTypeOptions"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10" v-if="hasSendTime">
              <el-form-item class="time-wrap" prop="remindTime">
                <el-date-picker
                  format="YYYY-MM-DD HH:mm"
                  type="datetime"
                  range-separator="-"
                  v-model="createPinForm.remindTime"
                  @change="handleRemindTime"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 回执提醒 -->
          <el-form-item>
            <template #label>
              <div class="labelTemplate">
                <img src="@/assets/pin-notice.png" class="icon" />
                <span>提醒:</span>
              </div>
            </template>
            <el-select
              v-model="repeatType"
              placeholder="未回执不提醒"
              @change="handleRepeatType"
            >
              <el-option
                v-for="item in remindTimeOptions"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              />
            </el-select>
          </el-form-item>

          <!-- 回执内容 -->
          <el-form-item>
            <template #label>
              <div class="labelTemplate">
                <img src="@/assets/pin-magicwords.png" class="icon" />
                <span>回执:</span>
              </div>
            </template>
            <div class="w-full"><span>回执内容设置</span></div>
          </el-form-item>
          <el-form-item prop="replyA">
            <template #label> </template>
            <div class="w-full flex items-center">
              <span class="mr-4"> A:</span>
              <el-input
                placeholder="内容不超过20字符"
                v-model="createPinForm.replyA"
              />
            </div>
          </el-form-item>
          <el-form-item prop="replyB">
            <template #label> </template>
            <div class="w-full flex items-center">
              <span class="mr-4"> B:</span>
              <el-input
                placeholder="内容不超过20字符"
                v-model="createPinForm.replyB"
              />
            </div>
          </el-form-item>
          <el-form-item prop="replyC">
            <template #label> </template>
            <div class="w-full flex items-center">
              <span class="mr-4"> C:</span>
              <el-input
                placeholder="内容不超过20字符"
                v-model="createPinForm.replyC"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="flex justify-end mt-2">
          <el-button @click="CreatePinDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onValidate(formRef)"
            >创建</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CreatePin",
});
</script>

<script lang="ts" setup>
import { noticeOption, noticeTypeOptions } from "@/constant/pin";
import { noticeOptionType } from "@/enums/pin";
import UploadFile from "@/components/UploadFile/index.vue";
import type { ElForm } from "element-plus";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { timeTypeOptions, remindTimeOptions } from "@/constant/pin";
import { reactive, ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { addMinutes } from "date-fns";
import { createPin } from "@/api/pin";
import { ElMessage } from "element-plus";
import { userOperateAuthority } from "@/enums/operateAuthority";
import { useGlobalStore } from "@/store/modules/global";
import {
  CreateDialogWidth,
  CreateDialogLabelWidth,
  CreateDialogContentHeight,
} from "@/constant/common";
const emits = defineEmits(["on-pinlist-refresh"]);

type FormInstance = InstanceType<typeof ElForm>;

const CreatePinDialogVisible = ref(false);
const createPinForm = reactive({
  content: "",
  attachments: [],
  userIds: [],
  remindTime: undefined,
  recipient: "",
  repeatIn: undefined,
  replyA: "",
  replyB: "",
  replyC: "",
  users: [],
});
// 提醒方式
const noticeType = ref(noticeOption.App);
const noticeTypeParamsMap = {
  [noticeOption.App]: [noticeOptionType.App],
  [noticeOption.Message]: [noticeOptionType.Message],
  [noticeOption.Phone]: [noticeOptionType.Phone],
  [noticeOption.AppAndMessage]: [
    noticeOptionType.App,
    noticeOptionType.Message,
  ],
  [noticeOption.AppAndPhone]: [noticeOptionType.App, noticeOptionType.Phone],
};
// 附件上传
const handleRemove = ({ url }) => {
  createPinForm.attachments = createPinForm.attachments.filter(
    (item) => item.attachmentUrl !== url
  );
};
const handleAdd = ({ name, url }) => {
  createPinForm.attachments.push({ name, attachmentUrl: url });
};
//选择接收者
const isReceptSelectVisible = ref(false);
const receptInput = ref();
const handleReceptContactSelectVisible = (visible: boolean) => {
  isReceptSelectVisible.value = visible;
  receptInput.value.blur();
};

const cancelReceptContactSelect = () => {
  isReceptSelectVisible.value = false;
};
const confirmReceptContactSelect = (list: any) => {
  createPinForm.userIds = list;
  list.map((item: any) => {
    createPinForm.users.push({ userId: item.id });
  });
  isReceptSelectVisible.value = false;
  createPinForm.recipient = createPinForm.userIds
    .map((item: any) => item.name)
    .join(",");
};
// 限制手动输入行为
const limitChange = () => {
  createPinForm.recipient = createPinForm.userIds
    .map((item) => item.name)
    .join(",");
};
// 发送时间
const hasSendTime = ref(false);
const handleRemindTime = () => {
  createPinForm.remindTime = new Date(createPinForm.remindTime).getTime();
};
const handleSendTime = () => {
  createPinForm.remindTime = hasSendTime.value
    ? addMinutes(new Date(), 30).getTime()
    : undefined;
};
// 回执提醒
const repeatType = ref();
const handleRepeatType = () => {
  createPinForm.repeatIn = repeatType.value ? repeatType.value : undefined;
};
// 点击创建按钮开始校验
const formRef = ref<FormInstance>();
const onValidate = (formEl: FormInstance | undefined) => {
  formEl
    .validate()
    .then(() => {
      const {
        content,
        attachments,
        users,
        repeatIn,
        replyA,
        replyB,
        replyC,
        remindTime,
      } = createPinForm;
      const magicwords = [];
      magicwords.push(replyA, replyB, replyC);
      const params = {
        content,
        attachments,
        users,
        remindTime,
        magicwords,
        repeatIn,
        noticeType: noticeTypeParamsMap[noticeType.value],
      };
      createPin(params)
        .then(() => {
          ElMessage.success({ message: "创建Pin成功" });
          CreatePinDialogVisible.value = false;
          emits("on-pinlist-refresh");
        })
        .catch((err) => {
          ElMessage.error({ message: `创建Pin失败：${err}` });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
// 校验规则
const rules = reactive({
  content: [
    {
      required: true,
      message: "请输入主题",
      trigger: "blur",
    },
    { max: 1000, message: "主题不超过1000字符", trigger: "blur" },
  ],
  recipient: [
    {
      required: true,
      message: "请选择接收人",
      trigger: "blur",
    },
  ],
  replyA: [{ max: 20, message: "内容不超过20字符", trigger: "blur" }],
  replyB: [{ max: 20, message: "内容不超过20字符", trigger: "blur" }],
  replyC: [{ max: 20, message: "内容不超过20字符", trigger: "blur" }],
  remindTime: [
    {
      required: true,
      message: "请选择截止时间",
      trigger: "change",
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value < Date.now()) {
          callback(new Error("发送时间必须大于当前时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});
// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.value.resetFields();
};
// 清空表单数据
watch(
  () => CreatePinDialogVisible.value,
  () => {
    if (!CreatePinDialogVisible.value) {
      if (!formRef.value) return;
      resetForm(formRef);
      hasSendTime.value = false;
      repeatType.value = "";
      createPinForm.attachments = [];
      noticeType.value = noticeOption.App;
      createPinForm.userIds = [];
      createPinForm.users = [];
    }
  }
);
// 是否有创建pin的权限
const canCreatePin = ref(false);
const globalStore = useGlobalStore();
canCreatePin.value = globalStore.operateAuthority.includes(
  userOperateAuthority.CreatePin
);
</script>

<style lang="less" scoped>
.creat-pin-dialog {
  overflow: auto;
  padding-right: 10px;
}
.button-wrap {
  padding: 25px 20px 7px 20px;
  :deep(.el-button) {
    width: 12rem;
  }
}
.create-form {
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
    width: 100%;
  }
  .time-wrap {
    :deep(.el-form-item__content) {
      margin-left: 20px !important;
      .el-date-editor {
        width: 210px;
      }
    }
  }
}
.labelTemplate {
  @apply flex items-center;
  img {
    @apply mr-1;
  }
}
</style>
