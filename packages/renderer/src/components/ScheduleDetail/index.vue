<template>
  <el-dialog
    custom-class="--calendar_detail-dialog"
    :modelValue="props.visible"
    @update:model-value="changeVisible"
    width="600px"
    destroy-on-close
  >
    <div v-loading="detail.loading">
      <div class="header px-8 pt-9 pb-4 relative">
        <div class="flex items-center absolute top-4 right-4">
          <template
            v-if="
              haveAuthority &&
              (detail.data.startTime > Date.now() || detail.data.isRepeat === 1)
            "
          >
            <!-- 有权限且(开始时间大于现在或是重复日程) -->
            <img
              src="@/assets/edit-icon-white.png"
              class="w-5 h-5 cursor-pointer mr-4"
              @click="detail.isEdit = true"
            />
          </template>
          <template
            v-if="
              (haveAuthority || selfIsParticipant) &&
              (detail.data.startTime > Date.now() || detail.data.isRepeat === 1)
            "
          >
            <!-- (有权限或是参与者)且(开始时间大于现在或是重复日程) -->
            <img
              src="@/assets/share-icon-white.png"
              class="w-5 h-5 cursor-pointer mr-4"
              @click="shareVisible = true"
            />
          </template>
          <template v-if="haveAuthority">
            <!-- 有权限 -->
            <img
              src="@/assets/del-icon-white.png"
              class="w-5 h-5 cursor-pointer mr-4"
              @click="handleDelete"
            />
          </template>
          <img
            src="@/assets/close-icon-white.png"
            class="w-4 h-4 cursor-pointer"
            @click="changeVisible(false)"
          />
        </div>
        <div class="text-base font-medium">
          {{ isSchedule ? "日程" : "会议" }}
        </div>
        <div class="text-sm my-2">{{ detail.data.name }}</div>
        <div class="text-sm">
          {{ format(detail.data.startTime || new Date(), "MM月dd日 HH:mm") }}
          -
          {{ format(detail.data.endTime || new Date(), "MM月dd日 HH:mm") }}
        </div>
      </div>
      <div v-if="detail.data.agendaInfo"></div>
      <div class="border-b item">
        <div class="w-20">主持人：</div>
        <div class="flex items-center">
          <template v-if="leader.length === 0">-</template>
          <template v-else-if="leader.length === 1">
            <UserAvatar
              :size="26"
              :src="get(leader, '[0].user.avatar')"
              :name="get(leader, '[0].user.realName[0]')"
              :id="get(leader, '[0].user.userId')"
            >
              <span>{{ get(leader, "[0].user.realName[0]") }}</span>
            </UserAvatar>
            <div class="ml-4">
              {{ get(leader, "[0].user.realName") }}
            </div>
          </template>
        </div>
      </div>
      <div class="users flex px-8 py-2">
        <div class="w-20 h-12 flex items-center">参与人：</div>
        <div v-if="participant.length === 0" class="h-12 flex items-center">
          -
        </div>
        <div v-else class="flex-auto">
          <el-collapse
            v-model="userActive"
            @change="(val) => (userActive = val)"
          >
            <el-collapse-item name="1">
              <template #title>
                <div class="w-full flex items-center">
                  <UserAvatar
                    v-for="item in participant.slice(0, 6)"
                    class="mr-5"
                    :key="item"
                    :size="26"
                    :src="get(item, 'user.avatar')"
                    :name="get(item, 'user.realName[0]')"
                    :id="get(item, 'user.userId')"
                  >
                    <span>{{ get(item, "user.realName[0]") }}</span>
                  </UserAvatar>
                  <div>等{{ participant.length }}人</div>
                </div>
              </template>
              <div class="h-32 overflow-y-auto">
                <div
                  v-for="item in participant"
                  :key="item"
                  class="flex justify-between items-center my-4"
                >
                  <div class="flex items-center">
                    <UserAvatar
                      :size="26"
                      :src="get(item, 'user.avatar')"
                      :name="get(item, 'user.realName[0]')"
                      :id="get(item, 'user.userId')"
                    >
                      <span>{{ get(item, "user.realName[0]") }}</span>
                    </UserAvatar>
                    <div class="ml-4">
                      {{ get(item, "user.realName") }}
                    </div>
                  </div>
                  <div class="mr-2">
                    {{
                      item.status === 1
                        ? "已接受"
                        : item.status === 2
                        ? "已拒绝"
                        : "待定"
                    }}
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      <div v-if="attachments.length > 0" class="item border-t">
        <div class="w-20">附件：</div>
        <div>
          <div
            v-for="item in attachments"
            :key="item.id"
            class="w-100 truncate"
          >
            <a @click="downloadAttachment(item)">{{ item.name }}</a>
          </div>
        </div>
      </div>
      <div v-if="detail.data.remark" class="flex px-8 py-2">
        <div class="flex-none w-20 h-12">描述：</div>
        <div>{{ detail.data.remark }}</div>
      </div>
    </div>
    <template #footer>
      <div v-if="detail.data.startTime > Date.now()">
        <div v-if="selfIsParticipant">
          <div
            v-if="get(detail, 'data.userStatus') === UserCalendarStatus.Refuse"
          >
            <el-button type="danger" plain>已拒绝</el-button>
            <el-button @click="handleAcceptCalendar">接受</el-button>
          </div>
          <div
            v-else-if="
              get(detail, 'data.userStatus') === UserCalendarStatus.Accept
            "
          >
            <el-button @click="handleRefuseCalendar">拒绝</el-button>
            <el-button type="success" plain>已接受</el-button>
          </div>
          <div v-else>
            <el-button @click="handleRefuseCalendar">拒绝</el-button>
            <el-button @click="handleAcceptCalendar">接受</el-button>
          </div>
        </div>
      </div>
      <div v-else>
        <div v-if="selfIsParticipant">
          <div
            v-if="get(detail, 'data.userStatus') === UserCalendarStatus.Refuse"
          >
            <el-button type="danger" plain>已拒绝</el-button>
          </div>
          <div
            v-else-if="
              get(detail, 'data.userStatus') === UserCalendarStatus.Accept
            "
          >
            <el-button type="success" plain>已接受</el-button>
          </div>
        </div>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="detail.deleteDialogVisible" width="300px">
    <div class="flex flex-col justify-center items-center">
      <img src="@/assets/confirm.png" class="w-24" />
      <div
        v-if="detail.data.isRepeat"
        class="mt-4 flex flex-col justify-center items-center"
      >
        <div>删除重复性{{ isSchedule ? "日程" : "会议" }}</div>
        <div class="mt-4 ml-12">
          <el-radio v-model="detail.deleteStatus" :label="1"
            >仅删除此{{ isSchedule ? "日程" : "会议" }}</el-radio
          >
          <el-radio v-model="detail.deleteStatus" :label="2"
            >删除后续重复性{{ isSchedule ? "日程" : "会议" }}</el-radio
          >
          <el-radio v-model="detail.deleteStatus" :label="0"
            >删除所有重复性{{ isSchedule ? "日程" : "会议" }}</el-radio
          >
        </div>
      </div>
      <div class="mt-4" v-else>
        确定删除当前{{ isSchedule ? "日程" : "会议" }}？
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center">
        <el-button @click="detail.deleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDelete">确定</el-button>
      </div>
    </template>
  </el-dialog>
  <CreateCalendarDialog
    :visible="detail.isEdit"
    @on-cancel="CreateCalendarDialogCancel"
    @on-confirm="handleEditConfirm"
    :type="
      detail.data.type === MeetingType.Schedule
        ? CreateCalendarType.Schedule
        : CreateCalendarType.Meeting
    "
    :detail="detail.data"
  />
  <ShareCalendarDialog
    :visible="shareVisible"
    @on-cancel="shareVisible = false"
    @on-confirm="handleShareConfirm"
    :detail="detail.data"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ScheduleDetail",
});
</script>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from "vue";
import {
  detailSchedule,
  deleteCalendar,
  acceptCalendar,
  refuseCalendar,
  MeetingMemberType,
  MeetingType,
} from "@/api/calendar";
import { format, getMonth, getDate, getYear } from "date-fns";
import { get } from "lodash-es";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { useCalendarStore } from "@/store/modules/calendar";
import { useGlobalStore } from "@/store/modules/global";
import CreateCalendarDialog from "@/components/CreateCalendarDialog/index.vue";
import ShareCalendarDialog from "@/components/ShareCalendarDialog/index.vue";
import { CreateCalendarType, UserCalendarStatus } from "@/enums/calendar";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { FILE_DOWNLOAD } from "@/../../main/channel";

interface Props {
  visible: boolean;
  data: { id: string; type: number };
}
const props = defineProps<Props>();
const emits = defineEmits(["on-change-visible"]);

const userStore = useUserStore();
const calendarStore = useCalendarStore();
const globalStore = useGlobalStore();
const haveAuthority = ref(false);
const changeVisible = (visible) => {
  emits("on-change-visible", visible);
};

const detail = reactive({
  loading: false,
  data: {},
  isEdit: false,
  deleteDialogVisible: false,
  deleteStatus: 0, //  0:删除所有 1:单次删除 2:删除后续
});
const unSharelist = ref();
const userActive = ref([]);
const isSchedule = computed(() => {
  const type = get(detail.data, "type");
  return type === MeetingType.Schedule;
});
const users = computed(() => get(detail.data, "users", []));
const leader = computed(() =>
  users.value.filter((item) => item.type === MeetingMemberType.Leader)
);
const participant = computed(() =>
  users.value.filter((item) => item.type === MeetingMemberType.Participant)
);
const attachments = computed(() => get(detail.data, "attachments", []));

const selfIsParticipant = ref(false);
const fetchDetail = async () => {
  detail.loading = true;
  const { data } = await detailSchedule({ id: props.data.id });
  if (data.code === 60000) {
    changeVisible(false);
    ElMessage.error({
      message: `该${props.data.type == 1 ? "日程" : "会议"}已被删除`,
    });
  } else if (data.code === 0) {
    detail.data = data.data;
    selfIsParticipant.value = data.data.users.some(
      (item) => item.userId === userStore.userId && item.type !== 1
    );
    const compere = data.data.users.find((item) => item.type === 1).userId;
    const authorityType = calendarStore.setMeAuthorityList.find(
      (item) => item.userVo.userId === compere
    )?.type;
    haveAuthority.value =
      authorityType === 0 || compere === userStore.userId ? true : false;
  }
  detail.loading = false;
  //设置不能分享的人员
  unSharelist.value = data.data.users.map((item) => {
    return { id: item.userId };
  });
  globalStore.addSelectDisableList(unSharelist.value);
};
const CreateCalendarDialogCancel = () => {
  detail.isEdit = false;
  globalStore.addSelectDisableList(unSharelist.value);
};
watch(
  () => props.visible,
  (newValue, oldValue) => {
    if (newValue === true) {
      fetchDetail();
    } else {
      globalStore.clearSelectDisableList();
    }
  }
);
const handleEditConfirm = () => {
  detail.isEdit = false;
  fetchDetail();
  calendarStore.fetchEvents();
};
const shareVisible = ref(false);
const handleShareConfirm = () => {
  fetchDetail();
  shareVisible.value = false;
};
const handleDelete = () => {
  detail.deleteDialogVisible = true;
};
const confirmDelete = () => {
  let params = { status: detail.deleteStatus };
  const yearInt = getYear(props.data.end);
  const monthInt = getMonth(props.data.end) + 1;
  const dayInt = getDate(+new Date(props.data.end) + 24 * 60 * 60 * 1000);
  if (params.status === 1 || params.status === 2) {
    params = {
      ...params,
      yearInt,
      monthInt,
      dayInt,
    };
  }

  deleteCalendar(props.data.id, params)
    .then(() => {
      detail.deleteDialogVisible = false;
      ElMessage.success({ message: "删除成功" });
      calendarStore.fetchEvents();
      changeVisible(false);
    })
    .catch((err) => {
      ElMessage.error({ message: `删除失败：${err}` });
    });
};
const downloadAttachment = (item: any) => {
  window.ipcRenderer.send(FILE_DOWNLOAD, {
    downloadPath: item.attachmentUrl, // 下载链接
    fileName: item.name, // 下载文件名
  });
};
const handleAcceptCalendar = () => {
  acceptCalendar(get(detail, "data.id"), {})
    .then(() => {
      fetchDetail();
    })
    .catch((err) => {
      ElMessage.error({ message: `接受失败：${err}` });
    });
};
const handleRefuseCalendar = () => {
  refuseCalendar(get(detail, "data.id"), {})
    .then(() => {
      fetchDetail();
    })
    .catch((err) => {
      ElMessage.error({ message: `拒绝失败：${err}` });
    });
};
</script>

<style lang="less" scoped>
.header {
  color: #fff;
  background: linear-gradient(to right, #04f6bf, 50%, #0093cd);
}
.item {
  @apply flex items-center px-8 py-4;
}
.users {
  :deep(.el-collapse) {
    border: none;
  }
  :deep(.el-collapse-item__header) {
    border: none;
  }
  :deep(.el-collapse-item__wrap) {
    border: none;
  }
}
</style>

<style lang="less">
.--calendar_detail-dialog {
  z-index: 1000;
  .el-dialog__header,
  .el-dialog__body {
    padding: 0;
  }
  .el-dialog__close {
    color: #fff;
  }
}
</style>
