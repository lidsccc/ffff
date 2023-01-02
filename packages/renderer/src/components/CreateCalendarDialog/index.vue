<template>
  <el-dialog
    :modelValue="props.visible"
    @update:model-value="closeDialog"
    :title="`${isEdit ? '编辑' : '创建'}${isMeeting ? '会议' : '日程'}`"
    :width="CreateDialogWidth"
    destroy-on-close
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="right"
      :label-width="CreateDialogLabelWidth"
      class="schedule-form"
      :style="{ height: `${CreateDialogContentHeight}vh` }"
    >
      <el-form-item prop="name">
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/subject_icon.png" class="icon" />
            <span>主题:</span>
          </div>
        </template>
        <el-input
          v-model="form.name"
          maxlength="255"
          show-word-limit
          placeholder="添加主题"
        />
      </el-form-item>
      <el-form-item prop="time">
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/time_icon.png" class="icon" />
            <span>时间:</span>
          </div>
        </template>
        <el-date-picker
          v-if="form.isAllday"
          v-model="form.time"
          popper-class="calendar-create-time_popover"
          format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
        <el-date-picker
          v-else
          v-model="form.time"
          popper-class="calendar-create-time_popover"
          format="YYYY-MM-DD HH-mm"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-row>
        <el-col :span="16">
          <el-form-item prop="repeatType">
            <el-select v-model="form.repeatType">
              <el-option
                v-for="item in repeatTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <CustomRepeatCalendar
              class="mt-4"
              v-if="form.repeatType === MeetingRepeatType.Custom"
              :data="{ ...repeatForm }"
              @on-data-change="handleDataChange"
            /> </el-form-item
        ></el-col>
        <el-col :span="8">
          <el-form-item prop="isAllday">
            <div class="flex justify-center items-center">
              <span>全天</span>
              <el-switch v-model="form.isAllday" />
            </div> </el-form-item
        ></el-col>
      </el-row>
      <el-form-item>
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/compere.png" class="icon" />
            <span>主持人:</span>
          </div>
        </template>
        <el-select v-model="compere" @change="changeCompere">
          <el-option
            class="flex items-center"
            v-for="item in compereList"
            :key="item.id"
            :label="item.userVo.realName"
            :value="item.userVo.userId"
          >
            <UserAvatar
              :size="26"
              :src="item.userVo.avatar"
              :name="item.userVo.realName"
              :id="item.userVo.userId"
            >
              <span>{{ item.userVo.realName[0] }}</span>
            </UserAvatar>
            <span class="ml-4">{{ item.userVo.realName }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/contacts_icon.png" class="icon" />
            <span>参与人:</span>
          </div>
        </template>
        <el-input
          :modelValue="selectedUser"
          placeholder="添加参与人"
          @click="isContactSelectVisible = true"
        />
        <ContactSelect
          :visible="isContactSelectVisible"
          :selected="form.users"
          @on-visible-change="handleContactSelectVisibleChange"
          @on-cancel="cancelContactSelect"
          @on-confirm="confirmContactSelect"
        />
      </el-form-item>
      <el-form-item>
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/notify_icon.png" class="icon" />
            <span>提醒:</span>
          </div>
        </template>
        <el-button type="text" v-if="addRemind" @click="addRemindHandler"
          >添加提醒</el-button
        >
        <el-row :gutter="20">
          <el-col :span="11">
            <el-select
              v-if="form.isAllday && !addRemind"
              v-model="form.allDayRemindTimeSelect"
            >
              <el-option
                v-for="item in alldayRemindTimeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select
              v-if="!form.isAllday && !addRemind"
              v-model="form.remindTimeSelect"
              @change="remindTimeSelectChange"
            >
              <el-option
                v-for="item in remindTimeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              /> </el-select
          ></el-col>
          <el-col :span="11">
            <el-select
              v-if="!addRemind"
              v-model="form.noticeType"
              multiple
              collapse-tags
            >
              <el-option
                v-for="item in remindTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              /> </el-select
          ></el-col>
          <el-col :span="2">
            <img
              v-if="!addRemind"
              @click="removeRemind()"
              src="@/assets/close-btn.png"
              class="removeRemind"
            />
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item prop="remark">
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/desc_icon.png" class="icon" />
            <span>描述:</span>
          </div>
        </template>
        <el-input
          v-model="form.remark"
          :rows="3"
          show-word-limit
          type="textarea"
          placeholder="添加描述"
        />
      </el-form-item>
      <el-form-item prop="attachments">
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/attachment_icon.png" class="icon" />
            <span>附件:</span>
          </div>
        </template>
        <UploadFile
          :multiple="true"
          :limit="9"
          :fileList="form.attachments"
          @on-remove="handleRemove"
          @on-add="handleAdd"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end mt-2">
        <el-button type="primary" @click="onSubmit(formRef)">确定</el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CreateScheduleDialog",
});
</script>

<script lang="ts" setup>
import { ref, reactive, computed, withDefaults, watch } from "vue";
import {
  CreateScheduleParams,
  EditScheduleExtraParams,
  createSchedule,
  editCalendar,
} from "@/api/calendar";
import {
  MeetingRepeatType,
  RemindType,
  CreateCalendarType,
} from "@/enums/calendar";
import * as dateFns from "date-fns";
import type { ElForm } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { useCalendarStore } from "@/store/modules/calendar";
import { useGlobalStore } from "@/store/modules/global";
import UploadFile from "@/components/UploadFile/index.vue";
import {
  remindTimeOptions,
  alldayRemindTimeOptions,
  repeatTypeOptions,
  remindTypeOptions,
} from "@/constant/calendar";
import { getShareSetList } from "@/api/calendar";
import CustomRepeatCalendar from "@/components/CustomRepeatCalendar/index.vue";
import { get, isEqual, pick, cloneDeep, difference } from "lodash-es";
import ContactSelect from "@/components/ContactSelect/index.vue";
import {
  CreateDialogWidth,
  CreateDialogLabelWidth,
  CreateDialogContentHeight,
} from "@/constant/common";
import UserAvatar from "@/components/UserAvatar/index.vue";

type FormInstance = InstanceType<typeof ElForm>;

const userStore = useUserStore();
const calendarStore = useCalendarStore();
const globalStore = useGlobalStore();

interface Props {
  visible: boolean;
  type: CreateCalendarType;
  detail?: object;
}
const props = withDefaults(defineProps<Props>(), { visible: true });
const emits = defineEmits(["on-cancel", "on-confirm"]);
const isMeeting = computed(() => props.type === CreateCalendarType.Meeting);
const formRef = ref<FormInstance>();
const form = reactive({
  name: "",
  isAllday: false,
  time: [],
  users: [],
  remindTimeSelect: "|",
  allDayRemindTimeSelect: "addHours|8",
  remark: "",
  attachments: [],
  repeatType: MeetingRepeatType.Once,
  noticeType: [],
});
const compere = ref(userStore.userId);
const compereList = ref();
const getShareSetListHandle = () => {
  const params = { type: 0, pageSize: 10000 };
  getShareSetList(params)
    .then((data) => {
      const self = [
        {
          id: 1,
          userVo: {
            realName: userStore.realName,
            userId: userStore.userId,
            avatar: userStore.avatar,
            telephone: userStore.telephone,
          },
        },
      ];
      compereList.value = [...self, ...data.items];
    })
    .catch((err) => {});
};
const changeCompere = () => {
  form.users = form.users.filter((item) => item.id !== compere.value);
  globalStore.addSelectDisableList([{ id: compere.value }]);
};
getShareSetListHandle();
const repeatForm = reactive({
  unit: 1,
  intervalInt: 1,
  deadlineType: 1,
  deadline: new Date(),
});
const isEdit = ref(false);
const addRemind = ref(true);
calendarStore.fetchSetting().then((setting) => {
  const { notAllDayRemind, allDayRemind } = setting;
  form.remindTimeSelect = remindTimeOptions.find(
    (item) => item.type === notAllDayRemind
  ).value;
  form.allDayRemindTimeSelect = alldayRemindTimeOptions.find(
    (item) => item.type === allDayRemind
  ).value;
});
const remindTimeSelectChange = (e: string) => {
  e === "|" ? removeRemind() : false;
};
const addRemindHandler = () => {
  addRemind.value = false;
  form.remindTimeSelect = "subMinutes|0";
  form.noticeType = [RemindType.App];
};
const removeRemind = () => {
  addRemind.value = true;
  form.remindTimeSelect = "|";
  form.noticeType = [];
};
watch(
  () => get(props, "visible"),
  () => {
    isEdit.value = !!get(props, "detail.id");
    if (!isEdit.value) {
      return;
    }
    // 编辑会议
    const {
      name,
      isAllday,
      startTime,
      endTime,
      users,
      remindTime,
      remark,
      attachments,
      repeatType,
      type,
      deadline,
      noticeType,
    } = props.detail;

    const repeats = props.detail.repeats || [];
    if (repeatType === MeetingRepeatType.Custom && repeats.length === 1) {
      repeatForm.unit = 1;
      repeatForm.intervalInt = repeats[0].intervalInt;
      repeatForm.deadlineType = !!deadline ? 2 : 1;
      repeatForm.deadline = new Date(deadline);
    }
    form.name = name;
    form.isAllday = !!isAllday;
    form.time = [new Date(startTime), new Date(endTime)];
    form.users = users
      .filter((item) => item.type !== 1)
      .map((item) => ({
        id: item.userId,
        name: item.user.realName,
        iconUrl: item.user.avatar,
      }));
    compere.value = users.find((item) => item.type === 1).userId;
    if (isAllday) {
      const hours = dateFns.differenceInHours(remindTime, startTime);
      form.allDayRemindTimeSelect =
        hours < 0 ? `subHours|${Math.abs(hours)}` : `addHours|${hours}`;
    } else {
      if (!remindTime) {
        addRemind.value = true;
        form.remindTimeSelect = "|";
      } else {
        addRemind.value = false;
        const days = dateFns.differenceInDays(startTime, remindTime);
        const minutes = dateFns.differenceInMinutes(startTime, remindTime);
        form.remindTimeSelect =
          days >= 1 ? `subDays|${days}` : `subMinutes|${minutes}`;
      }
    }
    form.remark = remark;
    form.attachments = attachments;
    form.repeatType = repeatType;
    form.noticeType = noticeType?.split(",");
  }
);
const isContactSelectVisible = ref(false);
const selectedUser = computed(() => {
  return form.users.map((item) => item.name).join(",");
});
const rules = reactive({
  name: [
    {
      required: true,
      message: "请输入主题",
      trigger: "blur",
    },
  ],
  time: [
    {
      required: true,
      message: "请选择时间",
      trigger: "blur",
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        const [start, end] = value;
        if (+start < +Date.now()) {
          callback(new Error("开始时间必须大于当前时间"));
        }
        if (+end < +start) {
          callback(new Error("结束时间必须大于开始时间"));
        }
        callback();
      },
      trigger: "blur",
    },
  ],
});
const handleContactSelectVisibleChange = (visible) => {
  isContactSelectVisible.value = visible;
};
const cancelContactSelect = () => {
  isContactSelectVisible.value = false;
};
const confirmContactSelect = (list) => {
  form.users = list;
  isContactSelectVisible.value = false;
};
watch(
  () => props.visible,
  (n, o) => {
    if (n === true) {
      globalStore.addSelectDisableList([{ id: compere.value }]);
    }
  }
);
watch(
  () => form.isAllday,
  (n, o) => {
    if (form.isAllday) {
      addRemind.value = false;
      form.noticeType = [RemindType.App];
      form.remindTimeSelect = "|";
    } else {
      form.remindTimeSelect = "subMinutes|0";
      if (addRemind.value) {
        form.remindTimeSelect = "|";
      }
    }
  }
);
const handleDataChange = (data) => {
  Object.keys(data).map((key) => (repeatForm[key] = data[key]));
};

const handleRemove = ({ url }) => {
  form.attachments = form.attachments.filter(
    (item) => item.attachmentUrl !== url
  );
};
const handleAdd = ({ name, url }) => {
  form.attachments.push({ name, attachmentUrl: url });
};

const formatRemindTime = () => {
  const { isAllday, remindTimeSelect, allDayRemindTimeSelect } = form;
  const [api, val] = (
    isAllday ? allDayRemindTimeSelect : remindTimeSelect
  ).split("|");
  const beginTime = form.time[0];
  if (api === "") {
    return val === 0 ? +beginTime : undefined;
  }
  return +dateFns[api](beginTime, val);
};
const formatRepeats = () => {
  const { repeatType } = form;
  if (repeatType === MeetingRepeatType.Once) {
    return [];
  }
  if (repeatType === MeetingRepeatType.WorkDay) {
    return [1, 2, 3, 4, 5].map((item) => ({
      intervalInt: 1,
      weekInt: item,
      unit: MeetingRepeatType.Week,
    }));
  }
  if (repeatType === MeetingRepeatType.Custom) {
    return [
      {
        intervalInt: repeatForm.intervalInt,
        unit: repeatForm.unit,
      },
    ];
  }
  return [
    {
      intervalInt: 1,
      unit: repeatType,
    },
  ];
};

const closeDialog = () => {
  globalStore.clearSelectDisableList();
  emits("on-cancel");
};
const handleClose = () => {
  ElMessageBox.confirm("退出后将无法保存更改，是否确定退出？").then(() => {
    form.users = [];
    addRemind.value = true;
    compere.value = userStore.userId;
    formRef.value?.resetFields();
    closeDialog();
  });
};

// 日程时间（开始时间、结束时间、重复参数）变更或地点变更推送通知
const calIsEditPush = (params) => {
  const before = pick(params, [
    "startTime",
    "endTime",
    "deadline",
    "repeatType",
    "repeats",
  ]);
  const after = pick(cloneDeep(props.detail), [
    "startTime",
    "endTime",
    "deadline",
    "repeatType",
    "repeats",
  ]);
  return isEqual(before, after) ? 0 : 1;
};
const formatTime = (time: any) => {
  const timeStr = new Date(time).toLocaleString();
  const timeStrWithoutSecond = timeStr.slice(0, timeStr.length - 2);
  const timeStrWithSecond = timeStrWithoutSecond.concat("00");
  return new Date(timeStrWithSecond).getTime();
};
const onSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl
    .validate()
    .then((valid) => {
      if (!valid) {
        return false;
      }
      const {
        name,
        isAllday,
        time,
        users,
        remark,
        attachments,
        repeatType,
        noticeType,
      } = form;

      const startTime = isAllday ? +dateFns.startOfDay(time[0]) : +time[0];
      const endTime = isAllday ? +dateFns.endOfDay(time[1]) : +time[1];
      const remindTime = formatRemindTime();
      const type = props.type;
      const repeats = formatRepeats();
      const deadline =
        repeatType === MeetingRepeatType.Custom && repeatForm.deadlineType === 2
          ? +repeatForm.deadline
          : undefined;

      const params: CreateScheduleParams & EditScheduleExtraParams = {
        name,
        isAllday: isAllday ? 1 : 0,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        remindTime,
        users: [
          {
            userId: compere.value,
            telephone: compereList.value.find(
              (item) => item.userVo.userId === compere.value
            ).userVo.telephone,
            type: 1, // 创建者
          },
          ...users.map((item) => ({
            userId: item.id,
            telephone: item.telephone,
            type: 0,
          })),
        ],
        remark,
        attachments,
        type,
        repeatType,
        isRepeat: !!repeatType ? 1 : 0,
        repeats,
        deadline,
        noticeType: [...noticeType].join(","),
      };
      if (isEdit.value) {
        params.id = props.detail.id;
        params.isEditPush = calIsEditPush(params);
        params.isAddPush =
          difference(params.users, props.detail.users).length > 0 ? 1 : 0;
        params.isDelPush =
          difference(props.detail.users, params.users).length > 0 ? 1 : 0;
        editCalendar(params)
          .then(() => {
            ElMessage.success({ message: "修改成功" });
            emits("on-confirm");
          })
          .catch((err) => {
            ElMessage.error({ message: `修改失败：${err}` });
          });
        return;
      }
      createSchedule(params)
        .then(() => {
          ElMessage.success({ message: "创建成功" });
          form.users = [];
          addRemind.value = true;
          compere.value = userStore.userId;
          formEl.resetFields();
          emits("on-confirm");
        })
        .catch((err) => {
          ElMessage.error({ message: `创建失败：${err}` });
        });
    })
    .catch((err) => console.log(err));
};
</script>

<style lang="less" scoped>
.schedule-form {
  overflow: auto;
  padding-right: 10px;
  .removeRemind {
    @apply w-4 h-4;
    margin-top: 10px;
  }
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
}
.labelTemplate {
  @apply flex items-center;
  img {
    @apply mr-1;
  }
}
</style>
<style lang="less">
.calendar-create-time_popover {
  .el-picker-panel__body {
    width: 464px;
  }
  .el-date-range-picker {
    width: 513px;
  }
  .el-date-range-picker__content {
    padding: 0;
  }
  .el-date-table-cell {
    height: 20px !important;
    padding: 0 !important;
  }
}
</style>
