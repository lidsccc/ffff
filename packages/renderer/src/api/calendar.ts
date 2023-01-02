import { http } from "@/utils/http/axios";
import { MeetingRepeatType } from "@/enums/calendar";

export enum MeetingMemberType {
  Leader = 1,
  Participant = 0,
}

export enum MeetingType {
  /** 日程 */
  Schedule = 1,
  /** 会议 */
  Meeting = 2,
}

export type CreateScheduleParams = {
  name: string;
  startTime: number;
  endTime: number;
  users: { userId: string; type: MeetingMemberType }[];
  remindTime: number;
  remark: string;
  attachments: { name: string; attachmentUrl: string }[];
  type: MeetingType;
  repeatType: MeetingRepeatType;
  repeats: any;
};
export type shareCalendarParams = {
  id: string;
  userId: string;
  type: any;
  moreInfo: string;
};
export type EditScheduleExtraParams = {
  id: string;
  isAddPush: number;
  isDelPush: number;
  isEditPush: number;
};

export function createSchedule(params: CreateScheduleParams) {
  return http.request({
    url: "/api/task/v1/fxAgenda",
    method: "post",
    params,
  });
}

export function editCalendar(
  params: CreateScheduleParams & EditScheduleExtraParams
) {
  return http.request({
    url: "/api/task/v1/fxAgenda",
    method: "put",
    params,
  });
}
export function shareCalendar(params: shareCalendarParams) {
  return http.request({
    url: `/api/task/v1/fxAgenda/share/${params.id}`,
    method: "put",
    params,
  });
}
export function listSchedule(params: any) {
  return http
    .request({
      url: "/api/task/v1/fxAgenda",
      method: "get",
      params,
    })
    .then((data) => {
      Object.keys(data).forEach((key) => {
        if (data[key] == null) {
          data[key] = undefined;
        }
      });
      return data;
    });
}
export function allListSchedule(params: any) {
  return http
    .request({
      url: "/api/task/v1/fxAgenda/allList",
      method: "get",
      params,
    })
    .then((data) => {
      Object.keys(data).forEach((key) => {
        if (data[key] == null) {
          data[key] = undefined;
        }
      });
      return data;
    });
}

export function detailSchedule(params: { id: string }) {
  return http.request(
    {
      url: `/api/task/v1/fxAgenda/${params.id}`,
      method: "get",
    },
    { isReturnNativeResponse: true }
  );
}

export function acceptCalendar(id: any, params: { reason?: string }) {
  return http.request({
    url: `/api/task/v1/fxAgenda/accept/${id}`,
    method: "put",
    params,
  });
}

export function refuseCalendar(id: any, params: { reason?: string }) {
  return http.request({
    url: `/api/task/v1/fxAgenda/refuse/${id}`,
    method: "put",
    params,
  });
}

export function deleteCalendar(id: string, params: { status: number }) {
  return http.request({
    url: `/api/task/v1/fxAgenda/${id}`,
    method: "delete",
    params,
  });
}

export function configCalendar(params: {
  notAllDayRemind: number;
  allDayRemind: number;
  defaultTime: number;
  refuseShow: number;
  onlyAcceptRemind: number;
  otherRefuseRemind: number;
}) {
  return http.request({
    url: "/api/task/v1/fxAgendaSet",
    method: "post",
    params,
  });
}

export function queryCalendarConfig() {
  return http.request({
    url: "/api/task/v1/fxAgendaSet",
    method: "get",
  });
}

export function setCalendarWeekDay(params: {
  insertVos: {
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    weekInt: number;
    status?: number;
  }[];
}) {
  return http.request({
    url: "/api/task/v1/fxWeekDay",
    method: "post",
    params,
  });
}

export function queryCalendarWeekDay(params: { userId: string }) {
  return http.request({
    url: "/api/task/v1/fxWeekDay",
    method: "get",
    params,
  });
}

export function enableCalendarWeekDay(params: { status: number }) {
  return http.request({
    url: "/api/task/v1/fxWeekDay/enable",
    method: "put",
    params,
  });
}

export function getShareList(params: any) {
  return http.request({
    url: "/api/task/v1/fxAgendaShare",
    method: "get",
    params,
  });
}

export function getShareSetList(params: any) {
  return http.request({
    url: "/api/task/v1/fxAgendaShare/set",
    method: "get",
    params,
  });
}

export function addShare(params: any) {
  return http.request({
    url: "/api/task/v1/fxAgendaShare",
    method: "post",
    params,
  });
}

export function deleteShare(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxAgendaShare/${params.id}`,
    method: "delete",
  });
}

export function editShare(params: any) {
  return http.request({
    url: "/api/task/v1/fxAgendaShare",
    method: "put",
    params,
  });
}
