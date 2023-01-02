import { http } from "@/utils/http/axios";
import qs from "qs";
import { CreateTaskParams } from "@/components/TaskComponents/type";
//任务列表
export function getTaskList(params: {
  userId: string;
  userStatus: number[];
  taskStatus: number[];
  pageNum?: number;
  pageSize?: number;
  sort?: number;
}) {
  const query = qs.stringify(params, { arrayFormat: "repeat" });
  return http.request({
    url: `/api/task/v2/fxTask?${query}`,
    method: "get",
  });
}

//任务详情
export function getTaskDetail(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxTask/${params.id}`,
    method: "get",
  });
}
//各任务总数
export function getTaskCount(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxTask/count/${params.id}`,
    method: "get",
  });
}
//创建任务（主任务，子任务一起上传）
export function createTask(params: CreateTaskParams) {
  return http.request({
    url: "/api/task/v1/fxTask/multiple",
    method: "post",
    params,
  });
}
//子任务详情
export function getSubTaskDetailList(params: {
  taskId: string;
  pageNum?: number;
  pageSize?: number;
  userId?: string;
}) {
  return http.request({
    url: `/api/task/v1/fxAction`,
    method: "get",
    params,
  });
}
//删除子任务
export function delSubTask(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxAction/${params.id}`,
    method: "delete",
  });
}
//完成任务
export function finishTask(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxTask/finish/${params.id}`,
    method: "put",
  });
}
//关闭任务
export function cancelTask(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxTask/cancel/${params.id}`,
    method: "put",
  });
}
//任务操作历史记录
export function getTaskLog(params: {
  taskId: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return http.request({
    url: "/api/task/v1/fxTaskLog",
    method: "get",
    params,
  });
}
//修改主任务
export function editMainTask(params: CreateTaskParams) {
  return http.request({
    url: "/api/task/v1/fxTask",
    method: "put",
    params,
  });
}
//修改子任务
export function editSubTask(params: any) {
  return http.request({
    url: "/api/task/v1/fxAction",
    method: "put",
    params,
  });
}

// 分享任务
export function shareTask(params: { id: string; users: { users: string[] } }) {
  return http.request({
    url: `/api/task/v1/fxTask/share/${params.id}`,
    method: "put",
    params: params.users,
  });
}

// 子任务催办
export function pressToDo(params: { id: string; users: { users: string[] } }) {
  return http.request({
    url: `/api/task/v1/fxAction/urge/${params.id}`,
    method: "put",
    params: params.users,
  });
}

// 子任务一键催办所有人
export function subtaskUrgeAll(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxAction/urgeAll/${params.id}`,
    method: "get",
  });
}
// 编辑主任务附件
export function editMainTaskFile(params: {
  id: string;
  attachments: { attachments: any[] };
}) {
  return http.request({
    url: `/api/task/v1/fxTask/addTaskAttachments/${params.id}`,
    method: "put",
    params: params.attachments,
  });
}
// 编辑主任务基础信息

export function editMainTaskInfo(params: {
  id: string;
  name?: string;
  deadline?: string;
  remark?: string;
}) {
  return http.request({
    url: `/api/task/v1/fxTask/updateInfo`,
    method: "put",
    params,
  });
}
// 更新主任务参与者、关注者
export function editMainTaskParticipants(params: {
  id: string;
  userIds: string[];
  shareUserIds: string[];
}) {
  return http.request({
    url: `/api/task/v1/fxTask/updateTaskParticipants`,
    method: "put",
    params,
  });
}
// 为主任务添加子任务
export function addSubtask(params: { list: any[]; taskId: string }) {
  return http.request({
    url: `/api/task/v1/fxAction/multiple`,
    method: "post",
    params,
  });
}
// 查询滞后任务列表
export function getDelayTask(params: { pageNum?: number; pageSize?: number }) {
  return http.request({
    url: "/api/task/v1/fxTask/delay",
    method: "get",
    params,
  });
}
