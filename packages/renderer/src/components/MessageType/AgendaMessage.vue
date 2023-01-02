<template>
  <div>
    <div class="w-[300px]" :class="{ bubble: props.showBubble }">
      <div
        class="h-[40px] px-[12px] flex items-center justify-between bg-[#00b0bb]"
      >
        <div class="text-white">
          {{ meetingType === 1 ? "日程" : "会议" }}
        </div>
        <div class="text-yellow-300 cursor-pointer" @click="openSchedule">
          {{ ActionMap[messageContent.action] }}
        </div>
      </div>
      <div class="px-[12px] bg-white flex flex-col justify-center">
        <div class="flex flex-col justify-center h-[120px]">
          <div class="truncate">主题（{{ messageContent.title }}）</div>
          <div class="mt-1 flex">
            <div class="w-[48px]">时间</div>
            <div>
              {{ time }}
            </div>
          </div>
          <div class="mt-1 flex">
            <div class="w-[48px]">预定人</div>
            <div>{{ name }}</div>
          </div>
        </div>
        <div class="pb-4" v-if="selfIsParticipant && isFuture">
          <el-input
            size="small"
            autosize
            :placeholder="`回复${name}`"
            v-model="reason"
          >
            <template #suffix>
              <el-popover
                :visible="agendaMessagePopoverVisible"
                placement="right"
                :width="160"
              >
                <p>您想接受还是拒绝该邀请?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="small" plain type="primary" @click="accept"
                    >接受</el-button
                  >
                  <el-button size="small" plain type="danger" @click="refuse"
                    >拒绝</el-button
                  >
                </div>
                <template #reference>
                  <el-icon
                    class="el-input__icon cursor-pointer"
                    @click="sendMessage"
                    ><Promotion
                  /></el-icon>
                </template>
              </el-popover>
            </template>
          </el-input>
        </div>
      </div>
    </div>
    <ScheduleDetail
      :visible="data.detailVisible"
      :data="data.detailData"
      @on-change-visible="(val) => (data.detailVisible = val)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AgendaMessage",
});
</script>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { get } from "lodash-es";
import { ElMessage } from "element-plus";
import { Message } from "@/types/message";
import { Promotion } from "@element-plus/icons-vue";
import { detailSchedule, acceptCalendar, refuseCalendar } from "@/api/calendar";
import { formatTime } from "@/utils/time";
import { useUserStore } from "@/store/modules/user";
import ScheduleDetail from "@/components/ScheduleDetail/index.vue";
import { useCalendarStore } from "@/store/modules/calendar";

const userStore = useUserStore();
const calendarStore = useCalendarStore();
const ActionMap = {
  0: "邀约",
  1: "提醒",
  2: "取消",
  3: "更新",
  4: "分享",
  5: "拒绝",
  6: "接收",
  7: "开始",
};

const data = reactive({
  detailVisible: false,
  detailData: {},
});
interface Props {
  detail: Message;
  showBubble?: boolean;
}
const openSchedule = () => {
  calendarStore.getShareSetListHandle();
  data.detailVisible = true;
  data.detailData = {
    id: id,
    type: meetingType,
  };
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
const meetingType = computed(() => {
  return get(messageContent.value, "data[0].type", 1);
});
const time = computed(() => {
  const data = get(messageContent.value, "data[0]", {});
  if (data.agendaDate) {
    const startTime = data.startTime.slice(0, 5);
    const endTime = data.endTime.slice(0, 5);
    return `${data.agendaDate} ${startTime}-${endTime}`;
  } else {
    return `${formatTime(data.startTime)} - ${formatTime(data.endTime)}`;
  }
});
const isFuture = computed(() => {
  const data = get(messageContent.value, "data[0]", {});
  if (data.agendaDate) {
    const time = `${data.agendaDate} ${data.startTime}`;
    return new Date(time).getTime() > Date.now();
  } else {
    return new Date(data.startTime).getTime() > Date.now();
  }
});
const name = computed(() => {
  return get(messageContent.value, "data[0].creatorVo.realName", "");
});
const selfIsParticipant = computed(() => {
  const users = get(messageContent.value, "data[0].users", []);
  return users.some(
    (item) => item.userId === userStore.userId && item.type !== 1
  );
});

const id = computed(() => {
  return get(messageContent.value, "data[0].id", "");
});
const agendaMessagePopoverVisible = ref(false);
const reason = ref("");
const sendMessage = () => {
  if (reason.value.trim() === "") return (reason.value = "");
  agendaMessagePopoverVisible.value = true;
};

const accept = async () => {
  const { data } = await detailSchedule({ id: id.value });
  if (data.code === 60000) {
    ElMessage.error({
      message: `该${meetingType.value === 1 ? "日程" : "会议"}已被删除`,
    });
    reason.value = "";
    agendaMessagePopoverVisible.value = false;
    return;
  } else if (data.code === 0 && data.data.userStatus === 1) {
    ElMessage.error({ message: "接受失败,您之前已经接受" });
    agendaMessagePopoverVisible.value = false;
    return;
  }
  acceptCalendar(id.value, { reason: reason.value })
    .then(() => {
      ElMessage.success({ message: "已接受" });
      reason.value = "";
    })
    .catch((err) => {
      ElMessage.error({ message: `接受失败：${err}` });
    })
    .finally(() => {
      agendaMessagePopoverVisible.value = false;
    });
};

const refuse = async () => {
  const { data } = await detailSchedule({ id: id.value });
  if (data.code === 60000) {
    ElMessage.error({
      message: `该${meetingType.value === 1 ? "日程" : "会议"}已被删除`,
    });
    reason.value = "";
    agendaMessagePopoverVisible.value = false;
    return;
  } else if (data.code === 0 && data.data.userStatus === 2) {
    ElMessage.error({ message: "拒绝失败,您之前已经拒绝" });
    agendaMessagePopoverVisible.value = false;
    return;
  }
  refuseCalendar(id.value, { reason: reason.value })
    .then(() => {
      ElMessage.success({ message: "已拒绝" });
      reason.value = "";
    })
    .catch((err) => {
      ElMessage.error({ message: `拒绝失败：${err}` });
    })
    .finally(() => {
      agendaMessagePopoverVisible.value = false;
    });
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
