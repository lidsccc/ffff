<template>
  <img
    src="@/assets/setting-icon-big.png"
    class="w-5 h-5"
    @click="visible = true"
  />
  <el-dialog v-model="visible" title="设置" :width="CreateDialogWidth">
    <el-form
      ref="formRef"
      :model="form"
      class="setting-form"
      :style="{ height: `${CreateDialogContentHeight}vh` }"
      label-width="210px"
    >
      <el-form-item label="非全天日程提醒">
        <el-select v-model="form.notAllDayRemind">
          <el-option
            v-for="item in remindTimeOptions"
            :key="item.type"
            :label="item.label"
            :value="item.type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="全天日程提醒">
        <el-select v-model="form.allDayRemind">
          <el-option
            v-for="item in alldayRemindTimeOptions"
            :key="item.type"
            :label="item.label"
            :value="item.type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日程默认时长">
        <el-select v-model="form.defaultTime">
          <el-option
            v-for="item in calendarDurationOptions"
            :key="item.value"
            :label="item.label"
            :value="item.type"
          />
        </el-select>
      </el-form-item>
      <el-divider />
      <el-form-item>
        <div class="switch-item">
          <div>显示我已拒绝的日程</div>
          <el-switch
            :modelValue="!!form.refuseShow"
            @change="(val) => (form.refuseShow = val ? 1 : 0)"
          />
        </div>
      </el-form-item>
      <el-form-item>
        <div class="switch-item">
          <div>仅提醒我已接受的日程</div>
          <el-switch
            :modelValue="!!form.onlyAcceptRemind"
            @change="(val) => (form.onlyAcceptRemind = val ? 1 : 0)"
          />
        </div>
      </el-form-item>
      <el-form-item>
        <div class="switch-item">
          <div>他人拒绝我的日程邀请时通知我</div>
          <el-switch
            :modelValue="!!form.otherRefuseRemind"
            @change="(val) => (form.otherRefuseRemind = val ? 1 : 0)"
          />
        </div>
      </el-form-item>
      <el-divider />
      <el-form-item label="我的工作时间">
        <el-checkbox-group v-model="checkedDays">
          <el-checkbox-button
            v-for="item in days"
            :key="item.value"
            :label="item.value"
            >{{ item.label }}</el-checkbox-button
          >
        </el-checkbox-group>
        <div class="flex flex-col">
          <div
            v-for="day in sortedCheckedDays"
            :key="day"
            style="width: 317px"
            class="flex mt-4"
          >
            <div class="w-11">周{{ DayNameList[day] }}</div>
            <el-time-picker
              v-model="weekDayTime[day]"
              is-range
              range-separator="-"
              format="HH:mm"
            />
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <div class="switch-item">
          <div>是否开启工作时间</div>
          <el-switch
            :disabled="weekDay.length === 0"
            :modelValue="isWeekDayEnable"
            @change="handleWeekDayEnable"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-center">
        <el-button type="primary" @click="onSubmit(formRef)">确定</el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CalendarSetting",
});
</script>

<script lang="ts" setup>
import { reactive, ref, computed } from "vue";
import {
  configCalendar,
  setCalendarWeekDay,
  enableCalendarWeekDay,
} from "@/api/calendar";
import {
  remindTimeOptions,
  calendarDurationOptions,
  alldayRemindTimeOptions,
} from "@/constant/calendar";
import { useCalendarStore } from "@/store/modules/calendar";
import { ElMessage, ElMessageBox } from "element-plus";
import { format, getHours, getMinutes } from "date-fns";
import {
  CreateDialogWidth,
  CreateDialogContentHeight,
} from "@/constant/common";
const calendarStore = useCalendarStore();

const days = ref([
  { label: "日", value: 7 },
  { label: "一", value: 1 },
  { label: "二", value: 2 },
  { label: "三", value: 3 },
  { label: "四", value: 4 },
  { label: "五", value: 5 },
  { label: "六", value: 6 },
]);
const DayNameList = ref({
  7: "日",
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
});

const formRef = ref();
const visible = ref(false);
const form = reactive({
  notAllDayRemind: 0,
  allDayRemind: 0,
  defaultTime: 0,
  refuseShow: 0,
  onlyAcceptRemind: 0,
  otherRefuseRemind: 0,
});
const weekDay = ref([]);
const checkedDays = ref([]);
const weekDayTime = ref(["", "", "", "", "", "", ""]);
const sortedCheckedDays = computed(() => {
  const sortedDays = [...checkedDays.value].sort((a, b) => a - b);
  const len = sortedDays.length;
  if (len > 1 && sortedDays[len - 1] === 7) {
    sortedDays.unshift(7);
    sortedDays.pop();
  }
  return sortedDays;
});
const isWeekDayEnable = computed(() => {
  return weekDay.value.some((item) => item.status);
});

const handleWeekDayEnable = (val) => {
  enableCalendarWeekDay({ status: val ? 1 : 0 }).then(() => {
    ElMessage.success({ message: `${val ? "开启" : "关闭"}工作日成功` });
    getWeekDay();
  });
};
const onSubmit = () => {
  const {
    notAllDayRemind,
    allDayRemind,
    defaultTime,
    refuseShow,
    onlyAcceptRemind,
    otherRefuseRemind,
  } = form;
  configCalendar({
    notAllDayRemind,
    allDayRemind,
    defaultTime,
    refuseShow,
    onlyAcceptRemind,
    otherRefuseRemind,
  })
    .then(() => {
      ElMessage.success({ message: "保存成功" });
      getSetting();
    })
    .catch((err) => {
      ElMessage.success({ message: `保存失败：${err}` });
      const {
        notAllDayRemind,
        allDayRemind,
        defaultTime,
        refuseShow,
        onlyAcceptRemind,
        otherRefuseRemind,
      } = calendarStore.setting;
      form.notAllDayRemind = notAllDayRemind;
      form.allDayRemind = allDayRemind;
      form.defaultTime = defaultTime;
      form.refuseShow = refuseShow;
      form.onlyAcceptRemind = onlyAcceptRemind;
      form.otherRefuseRemind = otherRefuseRemind;
    });

  const params = checkedDays.value.map((weekInt) => {
    const time = weekDayTime.value[weekInt];
    return {
      startHour: getHours(time[0]),
      startMinute: getMinutes(time[0]),
      endHour: getHours(time[1]),
      endMinute: getMinutes(time[1]),
      weekInt,
    };
  });
  setCalendarWeekDay({
    insertVos: params,
  }).then(() => {
    getWeekDay();
  });
};
const closeDialog = () => {
  visible.value = false;
};
const handleClose = () => {
  ElMessageBox.confirm("退出后将无法保存更改，是否确定退出？").then(() => {
    closeDialog();
  });
};
const getSetting = () => {
  calendarStore
    .fetchSetting()
    .then(
      ({
        notAllDayRemind,
        allDayRemind,
        defaultTime,
        refuseShow,
        onlyAcceptRemind,
        otherRefuseRemind,
      }) => {
        form.notAllDayRemind = notAllDayRemind;
        form.allDayRemind = allDayRemind;
        form.defaultTime = defaultTime;
        form.refuseShow = refuseShow;
        form.onlyAcceptRemind = onlyAcceptRemind;
        form.otherRefuseRemind = otherRefuseRemind;
      }
    );
};
getSetting();

const getWeekDay = () => {
  calendarStore.fetchWeekDay().then((data) => {
    weekDay.value = data;
    checkedDays.value = weekDay.value.map((item) => {
      const date = format(new Date(), "yyyy-MM-dd");
      weekDayTime.value[item.weekInt] = [
        new Date(`${date} ${item.startHour}:${item.startMinute}`),
        new Date(`${date} ${item.endHour}:${item.endMinute}`),
      ];
      return item.weekInt;
    });
  });
};
getWeekDay();
</script>

<style lang="less" scoped>
.setting-form {
  overflow: auto;
  :deep(.el-select) {
    width: 240px;
  }
  :deep(.el-input) {
    width: 240px;
  }
  :deep(.el-date-editor) {
    width: 140px;
  }
  .switch-item {
    margin-left: -100px;
    width: 300px;
    @apply flex justify-between items-center;
  }
}
</style>
