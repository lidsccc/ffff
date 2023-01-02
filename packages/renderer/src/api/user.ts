import { http } from "@/utils/http/axios";

export function basicUser() {
  return http.request({
    url: "/api/crm/v1/user/info",
    method: "get",
  });
}

export function detailUser(params: { id: string }) {
  return http.request({
    url: "/api/crm/v3/departmentMemberDetail",
    method: "get",
    params,
  });
}

export function listDetailUser({ userIds }: { userIds: string[] }) {
  return http.request({
    url: "/api/crm/v1/user",
    method: "get",
    params: {
      userIds: userIds.join(","),
      pageSize: 10000,
    },
  });
}

export function updateAvatar(params: { file: any }) {
  return http.request({
    url: "/api/crm/v1/updateAvatar",
    method: "post",
    params,
  });
}
