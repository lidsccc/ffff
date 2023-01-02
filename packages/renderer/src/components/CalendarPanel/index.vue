<template>
  <div class="calendar-panel">
    <CalendarSearch />
    <el-calendar
      :modelValue="calendarStore.selectedDate"
      @update:model-value="handleChangeDate"
    >
      <template #header>
        <span style="color: #333">{{
          format(calendarStore.selectedDate, "yyyy年MM月")
        }}</span>
        <div class="w-12 flex justify-between" style="color: #666">
          <el-icon @click="handlePrevMonth" class="cursor-pointer"
            ><arrow-left-bold
          /></el-icon>
          <el-icon @click="handleNextMonth" class="cursor-pointer"
            ><arrow-right-bold
          /></el-icon>
        </div>
      </template>
    </el-calendar>
    <CalendarGroup />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CalendarPanel",
});
</script>

<script lang="ts" setup>
import { ArrowLeftBold, ArrowRightBold } from "@element-plus/icons-vue";
import CalendarSearch from "@/components/CalendarSearch/index.vue";
import CalendarGroup from "@/components/CalendarGroup/index.vue";
import { useCalendarStore } from "@/store/modules/calendar";
import { format, subMonths, addMonths } from "date-fns";
const calendarStore = useCalendarStore();
const handleChangeDate = (val) => {
  calendarStore.setSelectedDate(val);
};
const handlePrevMonth = () => {
  const prevMonth = subMonths(calendarStore.selectedDate, 1);
  calendarStore.setSelectedDate(prevMonth);
};
const handleNextMonth = () => {
  const nextMonth = addMonths(calendarStore.selectedDate, 1);
  calendarStore.setSelectedDate(nextMonth);
};
</script>

<style lang="less" scoped>
.calendar-panel {
  background: #f5f5f5;
  :deep(.el-calendar) {
    --el-calendar-cell-width: 36px;
    width: 252px;
    background: #f5f5f5;
    .el-calendar__header {
      padding: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      border-bottom: none;
    }
    .el-calendar__body {
      padding: 0;
    }
    .el-calendar-table {
      .el-calendar-table__row {
        height: 36px;
      }
      .el-calendar-day {
        margin: 3px 0 0 3px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        &:hover {
          background: var(--theme-color);
        }
      }
      .current,
      .prev,
      .next {
        border: none;
      }
      .current {
        font-size: 12px;
        font-weight: 500;
        color: #333;
        &.is-today {
          .el-calendar-day {
            background: #e3e3e3;
          }
        }
        &.is-selected {
          background: transparent;
          .el-calendar-day {
            background: var(--theme-color);
          }
        }
      }
    }
  }
}
</style>
