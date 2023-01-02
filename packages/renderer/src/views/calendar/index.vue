<template>
  <el-container class="h-full">
    <el-aside class="select-none bg-[#f5f5f5]" width="266px">
      <CalendarPanel />
    </el-aside>
    <el-main class="full-calendar">
      <FullCalendar />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { onUnmounted } from "vue";
import CalendarPanel from "@/components/CalendarPanel/index.vue";
import FullCalendar from "@/components/FullCalendar/index.vue";
import { useCalendarStore } from "@/store/modules/calendar";

const calendarStore = useCalendarStore();
onUnmounted(() => {
  calendarStore.reset();
});
</script>

<style lang="less" scoped>
.full-calendar {
  padding: 0;
}
</style>
