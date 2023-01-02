import { http } from "@/utils/http/axios";
import { GroupMemberType } from "@/enums/message";

export function getImToken() {
  return http.request({
    url: "/api/ms/v1/iM/token",
    method: "get",
  });
}

export function addGroup(params: {
  /** 群名称 */
  name?: string;
  /** 群公告 */
  announcement?: string;
  /** 群主 */
  userId?: string;
  /** 群员 */
  member?: string[];
}) {
  return http.request({
    url: "/api/im/v1/addGroup",
    method: "post",
    params,
  });
}

export function detailGroup(params: {
  /** 群组id */
  groupId: string;
  /** 当前用户id */
  userId: string;
}) {
  return http.request({
    url: "/api/im/v1/groupDetail",
    method: "get",
    params,
  });
}

export function detailGroupV2(params: {
  /** 群组id */
  groupId: string;
  /** 当前用户id */
  userId: string;
}) {
  return http.request({
    url: "/api/im/v2/groupDetail",
    method: "get",
    params,
  });
}

export function deleteGroup(params: {
  /** 群组id */
  groupId: string;
  /** 当前用户id */
  userId: string;
}) {
  return http.request({
    url: "/api/im/v1/deleteGroup",
    method: "delete",
    params,
  });
}

// 群主可以移除所有人
// 群成员只能移除自己
export function removeGroupMember(params: {
  /** 群组id */
  groupId: string;
  /** 当前用户id */
  userId: string;
  /** 群成员id */
  member: string[];
}) {
  return http.request({
    url: "/api/im/v1/removeMember",
    method: "delete",
    params,
  });
}

export function addGroupMember(params: {
  /** 群组id */
  groupId: string;
  /** 当前用户id */
  userId: string;
  /** 群成员id */
  member: string[];
}) {
  return http.request({
    url: "/api/im/v1/addMember",
    method: "post",
    params,
  });
}

export function listGroupMember(params: {
  /** 群组id */
  groupId: string;
  /** 当前用户id */
  userId: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return http.request({
    url: "/api/im/v1/listMember",
    method: "get",
    params,
  });
}

export function listGroupMemberV2(params: {
  /** 群组id */
  groupId: string;
  /** 当前用户id */
  userId: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return http.request({
    url: "/api/im/v2/listMember",
    method: "get",
    params,
  });
}

export function updateGroup(params: {
  /** 群组id */
  groupId: string;
  /** 当前用户id */
  userId: string;
  isGroupNameEdit: number;
  name?: string;
  announcement?: string;
}) {
  return http.request({
    url: "/api/im/v1/updateGroup",
    method: "post",
    params,
  });
}

export function updateGroupAvatar(groupId: string, params: { avatar: any }) {
  return http.request({
    url: `/api/im/v1/${groupId}/updateGroupAvatar`,
    method: "post",
    params,
  });
}

export function listMyGroup(params: {
  isLeader?: number;
  userId: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return http.request({
    url: `/api/im/v1/listMyGroup`,
    method: "get",
    params,
  });
}
// 更新群主
export function updateGroupMaintainer(params: {
  newOwner: string;
  groupId: string;
  memberType: GroupMemberType;
}) {
  return http.request({
    url: `/api/im/v1/updateGroupMaintainer`,
    method: "post",
    params,
  });
}
// 添加群管理
export function updateGroupManager(params: {
  newOwner: string[];
  groupId: string;
}) {
  return http.request({
    url: `/api/im/v1/updateGroupAdmin`,
    method: "post",
    params,
  });
}
// 查询机器人详情
export function detailRobot(robotId: string) {
  return http.request({
    url: `api/ms/v1/fxRobot/${robotId}`,
    method: "get",
  });
}

// 批量查群组详情
export function listDetailGroup({ groupIds }: { groupIds: string[] }) {
  return http.request({
    url: "/api/im/v1/group",
    method: "get",
    params: {
      groupIds: groupIds.join(","),
      pageSize: 10000,
    },
  });
}

// 批量查机器人详情
export function listDetailRobot({ robotIds }: { robotIds: string[] }) {
  return http.request({
    url: "/api/ms/v1/fxRobot",
    method: "get",
    params: {
      robotIds: robotIds.join(","),
      pageSize: 10000,
    },
  });
}
