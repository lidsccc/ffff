import { http } from "@/utils/http/axios";

export function listDepartmentMemberZip(params: {
  userId?: string;
  pageNum: number; // 采用分页形式 传递末端userId情况下 pageNum 必须为1
  pageSize: number;
}) {
  return http.request({
    url: "/api/crm/v1/listDepartmentMemberZip",
    method: "get",
    params,
  });
}

export function checkUpdate() {
  return http.request({
    url: "/api/crm/v1/checkUpdate",
    method: "get",
  });
}
