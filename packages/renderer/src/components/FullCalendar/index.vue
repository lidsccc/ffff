<template>
  <div
    class="full-calendar-wrapper"
    :class="isWindows ? 'window-size-header' : ''"
  >
    <FullCalendar ref="calendarRef" :options="calendarOptions">
      <template #eventContent="arg">
        <b>{{ arg.timeText }}</b>
        <i>{{ arg.event.title }}</i>
      </template>
    </FullCalendar>
    <div
      class="setting-wrapper"
      :class="isWindows ? 'top-[31px]' : 'top-[21px]'"
    >
      <CalendarShare />
      <CalendarSetting />
    </div>
    <ScheduleDetail
      :visible="detail.visible"
      :data="detail.data"
      @on-change-visible="(val) => (detail.visible = val)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FullCalendar",
});
</script>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import "@fullcalendar/core/vdom";
import FullCalendar from "@fullcalendar/vue3"; // 核心库
import momentPlugin from "@fullcalendar/moment";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarStore } from "@/store/modules/calendar";
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import ScheduleDetail from "@/components/ScheduleDetail/index.vue";
import { Lunar, Solar } from "lunar-typescript";
import CalendarShare from "@/components/CalendarShare/index.vue";
import CalendarSetting from "@/components/CalendarSetting/index.vue";

const calendarRef = ref();
const calendarStore = useCalendarStore();

const isWindows = computed(() => window["$platform"] === "win32");

const detail = reactive({
  visible: false,
  data: {},
});

let calendarApi;
onMounted(() => {
  if (isWindows.value) {
    document
      .querySelector(".fc-header-toolbar")
      ?.classList.add("window-size-header");
  }
  calendarApi = calendarRef.value.getApi();
});

const calendarOptions = reactive({
  // Plugin
  plugins: [momentPlugin, timeGridPlugin, dayGridPlugin, interactionPlugin],
  // List View
  initialView: "dayGridMonth",
  // Toolbar
  customButtons: {
    todayButton: {
      text: "今天",
      click() {
        calendarStore.setSelectedDate(new Date());
      },
    },
    customPrevButton: {
      text: "<",
      click() {
        if (!calendarApi) {
          return;
        }
        const { currentViewType } = calendarApi.currentData;
        let date;
        if (currentViewType === "dayGridMonth") {
          date = subMonths(calendarStore.selectedDate, 1);
        } else if (currentViewType === "timeGridWeek") {
          date = subWeeks(calendarStore.selectedDate, 1);
        } else if (currentViewType === "timeGridDay") {
          date = subDays(calendarStore.selectedDate, 1);
        }
        calendarStore.setSelectedDate(date);
      },
    },
    customNextButton: {
      text: ">",
      click() {
        if (!calendarApi) {
          return;
        }
        const { currentViewType } = calendarApi.currentData;
        let date;
        if (currentViewType === "dayGridMonth") {
          date = addMonths(calendarStore.selectedDate, 1);
        } else if (currentViewType === "timeGridWeek") {
          date = addWeeks(calendarStore.selectedDate, 1);
        } else if (currentViewType === "timeGridDay") {
          date = addDays(calendarStore.selectedDate, 1);
        }
        calendarStore.setSelectedDate(date);
      },
    },
  },
  headerToolbar: {
    left: "todayButton customPrevButton customNextButton title",
    center: "",
    right: "timeGridDay,timeGridWeek,dayGridMonth",
  },
  titleFormat: {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
  buttonText: {
    month: "月",
    week: "周",
    day: "日",
  },
  // Date Library
  // titleFormat: "yyyy年MM月",
  // TimeGrid View
  allDaySlot: true,
  allDayText: "全天",
  // Now Indicator
  nowIndicator: true,
  // Business Hours
  // businessHours: {
  //   daysOfWeek: [1, 2, 3, 4, 5],
  //   startTime: "9:00",
  //   endTime: "18:00",
  // },
  //Events
  events: [],
  eventColor: "#00b0bb",
  eventBackgroundColor: "#fff",
  eventBorderColor: "#00b0bb",
  eventTextColor: "#00b0bb",
  eventDisplay: "block",
  eventTimeFormat: {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
  // Event Clicking & Hovering
  eventClick: function (info, el) {
    const { id, start, end } = info.event;
    detail.visible = true;
    detail.data = { id, start, end };
  },
  // Event Popover
  dayMaxEventRows: 3,
  // Locale
  locale: "zh-cn", // 自定义语言和本地化选项。字符串，默认是"en"。
  dayCellContent(data, createElement) {
    const { date, dayNumberText, view } = data;
    const { type } = view;

    if (type !== "dayGridMonth") {
      // 只有月视图显示阴历和节假日
      return dayNumberText;
    }

    const lunarDate = Lunar.fromDate(date);
    const chineseMonth = lunarDate.getMonthInChinese();
    const chineseDay = lunarDate.getDayInChinese();
    const lunarFestivals = lunarDate.getFestivals();
    const jieQi = lunarDate.getJieQi();

    const solarDate = Solar.fromDate(date);
    const solorFestivals = solarDate.getFestivals();

    const festivals = [...lunarFestivals, ...solorFestivals, ...jieQi];

    if (festivals.length > 0) {
      return createElement("div", {}, [
        createElement(
          "span",
          { style: { paddingRight: "12px", color: "#333" } },
          dayNumberText
        ),
        createElement(
          "span",
          { style: { color: "#CC0000" } },
          festivals.join(" ")
        ),
      ]);
    }

    return createElement("div", {}, [
      createElement(
        "span",
        { style: { paddingRight: "12px", color: "#333" } },
        dayNumberText
      ),
      chineseDay === "初一"
        ? createElement(
            "span",
            { style: { color: "#666" } },
            chineseMonth + "月"
          )
        : createElement("span", { style: { color: "#666" } }, chineseDay),
    ]);
  },
});

calendarStore.fetchEvents();
watch(
  () => calendarStore.selectedDate,
  (newVal, oldVal) => {
    if (calendarApi) {
      calendarApi.gotoDate(newVal);
      calendarApi.render();
    }
    calendarStore.fetchEvents();
  }
);
watch(
  () => calendarStore.selectedMonthEvents,
  (events) => {
    calendarOptions.events = events;
  }
);
watch(
  () => calendarStore.weekDay,
  (weekDay) => {
    const formatTimeInt = (int) => (int < 10 ? `0${int}` : `${int}`);
    calendarOptions.businessHours = weekDay
      .filter((item) => item.status === 1)
      .map((item) => ({
        daysOfWeek: [item.weekInt],
        startTime: `${formatTimeInt(item.startHour)}:${formatTimeInt(
          item.startMinute
        )}`,
        endTime: `${formatTimeInt(item.endHour)}:${formatTimeInt(
          item.endMinute
        )}`,
      }));
  }
);
</script>

<style lang="less" scoped>
.window-size-header {
  padding-top: calc(var(--layout-window-size-height) - 10px);
}
.full-calendar-wrapper {
  @apply h-full bg-white relative px-2;
  .setting-wrapper {
    display: flex;
    width: 52px;
    justify-content: space-between;
    position: absolute;
    right: 14px;
    cursor: pointer;
  }
  :deep(.fc-header-toolbar) {
    box-sizing: border-box;
    height: var(--content-header-height);
    padding-right: 27px;
    display: flex;
    align-items: center;
    margin-bottom: 0;
    .fc-toolbar-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      line-height: 34px;
    }
  }
  :deep(.fc-toolbar-chunk) {
    display: flex;
  }
  :deep(.fc-event-main) {
    @apply truncate;
  }
  :deep(.fc-popover) {
    z-index: 2001;
  }
  :deep(.fc) {
    height: 100%;
    display: flex;
    flex-direction: column;
    .fc-col-header-cell-cushion,
    .fc-daygrid-day-number {
      color: #666;
    }
    .fc-daygrid-more-link {
      color: var(--theme-color);
    }
    .fc-view-harness {
      flex: 1;
    }
    .fc-button,
    .fc-button-primary:focus {
      width: 34px;
      height: 34px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #666;
      background-color: #fff;
      border-color: #c2c2c2;
      box-shadow: none;
    }
    .fc-todayButton-button {
      width: 60px !important;
      cursor: pointer;
    }
    .fc-dayGridMonth-button {
      margin-right: 40px;
    }
    .fc-timeGridDay-button,
    .fc-timeGridWeek-button,
    .fc-dayGridMonth-button {
      width: 34px !important;
      &.fc-button-active {
        box-shadow: none;
        color: var(--theme-color);
        background-color: #e2f3f4;
      }
    }
  }
}
</style>
