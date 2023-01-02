<template>
  <div class="flex justify-between items-center px-2 container">
    <el-autocomplete
      class="search-input flex-grow"
      placeholder="请输入搜索内容"
      :debounce="500"
      clearable
      popper-class="calendar-search-popper"
      :prefix-icon="Search"
      v-model="data.keyword"
      :fetch-suggestions="querySearchAsync"
      value-key="name"
      @select="handleSelect"
    />
    <el-popover placement="bottom" trigger="click">
      <template #reference>
        <img src="@/assets/add-icon.png" class="w-6 h-6 ml-2 cursor-pointer" />
      </template>
      <div>
        <div class="create-item" @click="createMeeting">
          <img src="@/assets/schedule-icon.png" class="w-4 h-4 mr-3" />创建会议
        </div>
        <div class="create-item" @click="createSchedule">
          <img src="@/assets/metting-icon.png" class="w-4 h-4 mr-3" />创建日程
        </div>
      </div>
    </el-popover>
    <CreateCalendarDialog
      :type="data.createType"
      :visible="data.createVisible"
      @on-cancel="data.createVisible = false"
      @on-confirm="handleCreateConfirm"
    />
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
  name: "CalendarSearch",
});
</script>

<script lang="ts" setup>
import { reactive } from "vue";
import { Search } from "@element-plus/icons-vue";
import CreateCalendarDialog from "@/components/CreateCalendarDialog/index.vue";
import { CreateCalendarType } from "@/enums/calendar";
import { useCalendarStore } from "@/store/modules/calendar";
import { useUserStore } from "@/store/modules/user";
import { listSchedule } from "@/api/calendar";
import ScheduleDetail from "@/components/ScheduleDetail/index.vue";

const calendarStore = useCalendarStore();
const userStore = useUserStore();

const data = reactive({
  keyword: "",
  createVisible: false,
  createType: null,
  detailVisible: false,
  detailData: {},
});

const createSchedule = () => {
  data.createVisible = true;
  data.createType = CreateCalendarType.Schedule;
};

const createMeeting = () => {
  data.createVisible = true;
  data.createType = CreateCalendarType.Meeting;
};

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  console.log("querySearchAsync", queryString);
  listSchedule({
    isRepeat: 0,
    name: data.keyword,
    userId: userStore.userId,
  }).then(({ items }) => {
    cb(items);
  });
};

const handleSelect = (item) => {
  console.log("handleSelect", item);
  data.detailData = {
    id: item.id,
    start: item.startTime,
    end: item.endTime,
  };
  data.detailVisible = true;
};

const handleCreateConfirm = () => {
  calendarStore.fetchEvents();
  data.createVisible = false;
};
</script>

<style lang="less" scoped>
.container {
  height: var(--content-header-height);
}
.create-item {
  @apply py-1 flex justify-center items-center cursor-pointer hover:bg-gray-200;
}
</style>
