<template>
  <!-- 人员列表 -->
  <div class="p-2 bg-white rounded-md cursor-pointer select-none">
    <div class="mb-1 font-semibold">{{ taskDetail?.name }}</div>
    <div class="flex py-2 items-center">
      <span>创建者：</span>
      <div
        class="user-block cursor-pointer w-18 px-2 rounded-full items-center flex py-1"
      >
        <UserAvatar
          :size="26"
          :src="get(taskDetail, 'user.avatar')"
          :name="get(taskDetail, 'user.realName[0]')"
          :id="get(taskDetail, 'user.userId')"
        >
          <span>{{ get(taskDetail, "user.realName[0]") }}</span>
        </UserAvatar>
        <div class="ml-1 text-sm name-block">
          {{ get(taskDetail, "user.realName") }}
        </div>
      </div>
    </div>
    <div class="flex mb-4 h-7 items-center">
      <div><span>参与者：</span></div>
      <div class="mr-1 h-7" v-for="item in iconList" :key="item.id">
        <UserAvatar
          :size="28"
          :src="get(item, 'user.avatar')"
          :name="get(item, 'user.realName[0]')"
          :id="get(item, 'user.userId')"
        >
          <span>{{ get(item, "user.realName[0]") }}</span>
        </UserAvatar>
      </div>
      <div class="gray-text leading-7" v-show="taskDetail.users?.length > 5">
        等{{ taskDetail?.users?.length }}人
      </div>
    </div>
    <div class="mb-2 text-xs flex items-center">
      <TaskStatusTag :taskStatus="taskDetail.status" />
      <span class="mr-2">{{ format(taskDetail?.deadline, "MM月dd日") }}</span
      ><span class="mr-2"> {{ format(taskDetail?.deadline, "HH:mm") }}</span>
      <span>截止</span>
    </div>
    <div class="mb-2 text-xs" v-if="isFinished">
      <div v-if="taskDetail.finishTime">
        <span class="mr-2">完成时间</span
        ><span class="mr-2">{{
          format(taskDetail?.finishTime, "MM月dd日")
        }}</span
        ><span class="mr-2">
          {{ format(taskDetail?.finishTime, "HH:mm") }}</span
        >
      </div>
      <div v-else>
        <span class="mr-2">关闭时间</span
        ><span class="mr-2">{{
          format(taskDetail?.closeTime, "MM月dd日")
        }}</span
        ><span class="mr-2"> {{ format(taskDetail?.closeTime, "HH:mm") }}</span>
      </div>
    </div>
    <div v-else>
      <div class="mb-2">
        <el-progress :percentage="taskDetail?.progress" />
      </div>
      <div class="alert text-xs" v-show="taskDetail?.delayStatus">
        任务进度可能滞后
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "TaskPanel",
});
</script>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { selectTaskList } from "@/store/modules/task";
import { format } from "date-fns";
import { FinishedType } from "@/enums/taskStatus";
import TaskStatusTag from "@/components/TaskComponents/TaskStatusTag.vue";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";
type Props = {
  taskDetail: selectTaskList;
};
const props = defineProps<Props>();

//头像最多展示5个
const MAX_ICON_COUNT = 5;
const iconList = computed(() => {
  const users = props.taskDetail?.users;
  return users.slice(
    0,
    users.length > MAX_ICON_COUNT ? MAX_ICON_COUNT - 1 : users.length
  );
});
const taskDetail = computed(() => {
  return props.taskDetail;
});
const isFinished = ref(false);
if (
  props.taskDetail.status == FinishedType.FINISHED ||
  props.taskDetail.status == FinishedType.SHUTDOWN
)
  isFinished.value = true;
</script>

<style scoped>
.detailhover:hover {
  background: rgb(234, 234, 234);
}
.alert {
  color: #ff4747;
}

.gray-text {
  color: #666666;
}
.user-block {
  background-color: #f7f8fa;
}
.name-block {
  max-width: 44px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
