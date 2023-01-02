import { http } from "@/utils/http/axios";

//我的部门
export function getMyDepartment(params: { id: string }) {
  return http.request({
    url: "/api/crm/v1/myDepartment",
    method: "get",
    params,
  });
}

//部门人员信息
export function listDepartmentMember(params: {
  id: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return http.request({
    url: "/api/crm/v1/listDepartmentMember",
    method: "get",
    params,
  });
}

//获得组织架构
export function getDepartmentStructure(params: { parentId: string }) {
  return http.request({
    url: "/api/crm/v1/getDepartmentStructureListPage",
    method: "get",
    params,
  });
}
