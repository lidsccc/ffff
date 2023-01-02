import { defineStore } from "pinia";
import {
  format,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  addDays,
  getMonth,
  getDay,
  getDate,
} from "date-fns";
import {
  listSchedule,
  getShareSetList,
  allListSchedule,
  queryCalendarConfig,
  queryCalendarWeekDay,
} from "@/api/calendar";
import { MeetingRepeatType } from "@/enums/calendar";
import { useUserStore } from "./user";

export type CalendarSetting = {
  notAllDayRemind: number;
  allDayRemind: number;
  defaultTime: number;
  refuseShow: number;
  onlyAcceptRemind: number;
  otherRefuseRemind: number;
};

export type WeekDayItem = {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  weekInt: number;
  status: number;
};

export const useCalendarStore = defineStore({
  id: "calendar", // id 必填且需要唯一

  state: (): {
    selectedDate: Date;
    selectedMonthEvents: any[];
    setting: CalendarSetting;
    weekDay: WeekDayItem[];
    setMeAuthorityList: any[];
    hasCheckedUserList: any[];
  } => {
    return {
      selectedDate: new Date(),
      selectedMonthEvents: [],
      setting: {
        notAllDayRemind: 0,
        allDayRemind: 0,
        defaultTime: 0,
        refuseShow: 0,
        onlyAcceptRemind: 0,
        otherRefuseRemind: 0,
      },
      weekDay: [],
      setMeAuthorityList: [],
      hasCheckedUserList: [],
    };
  },

  getters: {},

  actions: {
    setSelectedDate(date: Date) {
      this.selectedDate = date;
    },
    setCheckUserList(flag: boolean, userId: string) {
      if (flag) {
        this.hasCheckedUserList.push(userId);
      } else {
        this.hasCheckedUserList = this.hasCheckedUserList.filter(
          (item) => item !== userId
        );
      }
    },
    reset() {
      //选择的人员置为空
      this.hasCheckedUserList = [];
      //重新赋值为当前时间
      this.selectedDate = new Date();
    },

    async getShareSetListHandle() {
      const data = await getShareSetList({ pageSize: 1000 });
      if (data.items?.length) {
        this.setMeAuthorityList = data.items;
      }
    },
    async fetchEvents() {
      const userStore = useUserStore();
      // 查询非重复性日程
      const { items } = await listSchedule({
        isRepeat: 0,
        startTimeStart: +startOfMonth(this.selectedDate),
        startTimeEnd: +endOfMonth(this.selectedDate),
        pageNum: 1,
        pageSize: 1000000,
        userId: userStore.userId, // 查询与自己有关的日程
      });
      const otherNoRepeatlist = [];
      const otherRepeatlist = [];
      //如果有被设为订阅者或编辑者
      if (this.hasCheckedUserList.length) {
        const usersStr = this.hasCheckedUserList.join(",");
        //查询他人非重复日程
        const otherNoRepeat = await allListSchedule({
          isRepeat: 0,
          userIds: usersStr,
        });
        if (otherNoRepeat.length) {
          for (let i = 0; i < otherNoRepeat.length; i++) {
            if (otherNoRepeat[i].fxAgendaVos !== null) {
              for (let j = 0; j < otherNoRepeat[i].fxAgendaVos.length; j++) {
                if (otherNoRepeat[i].fxAgendaVos[j].isDel === 0) {
                  otherNoRepeatlist.push(otherNoRepeat[i].fxAgendaVos[j]);
                }
              }
            }
          }
        }
        //查询他人重复日程
        const otherRepeat = await allListSchedule({
          isRepeat: 1,
          userIds: usersStr,
        });
        if (otherRepeat.length) {
          for (let i = 0; i < otherRepeat.length; i++) {
            if (otherRepeat[i].fxAgendaVos !== null) {
              for (let j = 0; j < otherRepeat[i].fxAgendaVos.length; j++) {
                if (otherRepeat[i].fxAgendaVos[j].isDel === 0) {
                  otherRepeatlist.push(otherRepeat[i].fxAgendaVos[j]);
                }
              }
            }
          }
        }
      }
      const allNoRepeatList = [...items, ...otherNoRepeatlist];
      const noRepeatEvents = allNoRepeatList.map(
        ({ id, name, isAllday, startTime, endTime }: any) => {
          const isTodo = startTime >= +Date.now();
          return {
            id,
            title: name,
            allDay: isAllday,
            start: format(startTime, "yyyy-MM-dd HH:mm"),
            end: format(endTime, "yyyy-MM-dd HH:mm"),
            backgroundColor: isTodo ? "#fff" : "rgba(201, 201, 201, 0.2)",
            borderColor: isTodo ? "#00b0bb" : "transparent",
            textColor: isTodo ? "#00b0bb" : "#B1ACAC",
          };
        }
      );
      // 查询重复性日程
      const { items: repeatItems } = await listSchedule({
        isRepeat: 1,
        pageNum: 1,
        pageSize: 1000000,
        userId: userStore.userId, // 查询与自己有关的日程
      });
      let repeatEvents: any[] = [];
      const allRepeatList = [...repeatItems, ...otherRepeatlist];
      allRepeatList.forEach((repeatItem: any) => {
        const { id, name, isAllday, startTime, endTime, deadline } = repeatItem;
        const repeats = repeatItem.repeats || [];
        const filters = repeatItem.filters || [];
        // 工作日重复
        if (
          repeats.length === 5 &&
          repeats.every(
            (item: any) =>
              item.intervalInt === 1 && item.unit === MeetingRepeatType.Week
          )
        ) {
          const startDate = startOfMonth(this.selectedDate);
          let start = new Date(
            `${format(startDate, "yyyy-MM-dd")} ${format(startTime, "HH:mm")}`
          );
          while (getMonth(start) === getMonth(this.selectedDate)) {
            if (
              +new Date(start) < startTime ||
              getDay(start) === 6 ||
              getDay(start) === 0
            ) {
              start = addDays(start, 1);
              continue;
            }
            if (deadline && +new Date(start) > deadline) {
              break;
            }
            const isTodo = +new Date(start) >= +Date.now();

            repeatEvents.push({
              id,
              title: name,
              allDay: isAllday,
              start,
              end: addDays(
                endTime,
                differenceInDays(new Date(start), new Date(startTime))
              ),
              backgroundColor: isTodo ? "#fff" : "rgba(201, 201, 201, 0.2)",
              borderColor: isTodo ? "#00b0bb" : "transparent",
              textColor: isTodo ? "#00b0bb" : "#B1ACAC",
            });
            start = addDays(start, 1);
          }
        }

        // 按天重复
        if (repeats.length === 1 && repeats[0].unit === MeetingRepeatType.Day) {
          const interval = repeats[0].intervalInt;
          const startDate = startOfMonth(this.selectedDate);
          let start = new Date(
            `${format(startDate, "yyyy-MM-dd")} ${format(startTime, "HH:mm")}`
          );

          while (getMonth(start) === getMonth(this.selectedDate)) {
            if (+new Date(start) < startTime) {
              //如果当月开始时间与日程开始时间相差小于定义周期天数,天数加一
              if (differenceInDays(start, startTime) < 1) {
                start = addDays(start, 1);
                continue;
              }
              start = addDays(start, interval);
              continue;
            }
            const end = addDays(
              endTime,
              differenceInDays(new Date(start), new Date(startTime))
            );
            if (deadline && (+new Date(start) > deadline || deadline < end)) {
              break;
            }
            const isTodo = +new Date(start) >= +Date.now();

            repeatEvents.push({
              id,
              title: name,
              allDay: isAllday,
              start,
              end,
              backgroundColor: isTodo ? "#fff" : "rgba(201, 201, 201, 0.2)",
              borderColor: isTodo ? "#00b0bb" : "transparent",
              textColor: isTodo ? "#00b0bb" : "#B1ACAC",
            });
            start = addDays(start, interval);
          }
        }

        // 每周重复
        if (
          repeats.length === 1 &&
          repeats[0].intervalInt === 1 &&
          repeats[0].unit === MeetingRepeatType.Week
        ) {
          const startDate = startOfMonth(this.selectedDate);
          let start = new Date(
            `${format(startDate, "yyyy-MM-dd")} ${format(startTime, "HH:mm")}`
          );
          while (getMonth(start) === getMonth(this.selectedDate)) {
            if (
              +new Date(start) < startTime ||
              getDay(start) !== getDay(startTime)
            ) {
              start = addDays(start, 1);
              continue;
            }
            if (deadline && +new Date(start) > deadline) {
              break;
            }
            const isTodo = +new Date(start) >= +Date.now();

            repeatEvents.push({
              id,
              title: name,
              allDay: isAllday,
              start,
              end: addDays(
                endTime,
                differenceInDays(new Date(start), new Date(startTime))
              ),
              backgroundColor: isTodo ? "#fff" : "rgba(201, 201, 201, 0.2)",
              borderColor: isTodo ? "#00b0bb" : "transparent",
              textColor: isTodo ? "#00b0bb" : "#B1ACAC",
            });
            start = addDays(start, 1);
          }
        }

        // 每月重复
        if (
          repeats.length === 1 &&
          repeats[0].intervalInt === 1 &&
          repeats[0].unit === MeetingRepeatType.Month
        ) {
          const start = `${format(this.selectedDate, "yyyy-MM")}-${format(
            startTime,
            "dd HH:mm"
          )}`;
          if (
            (deadline && +new Date(start) > deadline) ||
            +new Date(start) < startTime
          ) {
            return;
          }
          const isTodo = +new Date(start) >= +Date.now();

          repeatEvents.push({
            id,
            title: name,
            allDay: isAllday,
            start,
            end: addDays(
              endTime,
              differenceInDays(new Date(start), new Date(startTime))
            ),
            backgroundColor: isTodo ? "#fff" : "rgba(201, 201, 201, 0.2)",
            borderColor: isTodo ? "#00b0bb" : "transparent",
            textColor: isTodo ? "#00b0bb" : "#B1ACAC",
          });
        }

        // 每年重复
        const month = getMonth(startTime);
        const curMonth = getMonth(this.selectedDate);
        if (
          repeats.length === 1 &&
          repeats[0].intervalInt === 1 &&
          repeats[0].unit === MeetingRepeatType.Year &&
          // 是当前月份创建的
          month === curMonth
        ) {
          const start = `${format(this.selectedDate, "yyyy")}-${format(
            startTime,
            "MM-dd HH:mm"
          )}`;
          if (
            (deadline && +new Date(start) > deadline) ||
            +new Date(start) < startTime
          ) {
            return;
          }
          const isTodo = +new Date(start) >= +Date.now();

          repeatEvents.push({
            id,
            title: name,
            allDay: isAllday,
            start,
            end: addDays(
              endTime,
              differenceInDays(new Date(start), new Date(startTime))
            ),
            backgroundColor: isTodo ? "#fff" : "rgba(201, 201, 201, 0.2)",
            borderColor: isTodo ? "#00b0bb" : "transparent",
            textColor: isTodo ? "#00b0bb" : "#B1ACAC",
          });
        }

        // 过滤删除的循环日程
        filters.forEach((item: any) => {
          repeatEvents = repeatEvents.filter((e) => {
            const date = new Date(e.start);
            const day = getDate(date);
            const month = getMonth(date) + 1;
            const year = date.getFullYear();
            if (
              e.id === id &&
              year === item.yearInt &&
              month === item.monthInt &&
              day === item.dayInt
            ) {
              return false;
            }
            return true;
          });
        });
      });
      this.selectedMonthEvents = [...noRepeatEvents, ...repeatEvents];
    },
    async fetchSetting() {
      return queryCalendarConfig().then(
        ({
          notAllDayRemind,
          allDayRemind,
          defaultTime,
          refuseShow,
          onlyAcceptRemind,
          otherRefuseRemind,
        }) => {
          const setting = {
            notAllDayRemind,
            allDayRemind,
            defaultTime,
            refuseShow,
            onlyAcceptRemind,
            otherRefuseRemind,
          };
          this.setting = setting;
          return setting;
        }
      );
    },
    async fetchWeekDay() {
      const userStore = useUserStore();
      return queryCalendarWeekDay({ userId: userStore.userId }).then(
        ({ items }) => {
          this.weekDay = items;
          return items;
        }
      );
    },
  },
});
