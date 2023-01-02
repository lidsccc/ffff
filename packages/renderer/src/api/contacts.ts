import { http } from "@/utils/http/axios";

interface Contact {
  code: string;
  isGroup: number;
}

interface TopContactParams {
  userId: string;
  contact: Contact[];
}

export function addTopContact(params: TopContactParams) {
  return http.request({
    url: "/api/im/v1/addContact",
    method: "post",
    params,
  });
}

export function deleteTopContact(params: TopContactParams) {
  return http.request({
    url: "/api/im/v1/deleteContact",
    method: "delete",
    params,
  });
}

export function checkTopContact(params: { userId: string; contactId: string }) {
  return http.request({
    url: "/api/im/v1/checkIsContact",
    method: "get",
    params,
  });
}

export function listTopContact(params: {
  userId: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return http.request({
    url: "/api/im/v1/listContact",
    method: "get",
    params,
  });
}

export function listDepartmentMember(params: {
  name?: string;
  id?: string;
  telephone?: string;
  userSpell?: string;
}) {
  return http.request({
    url: "/api/crm/v3/listDepartmentMember",
    method: "get",
    params,
  });
}

// 手机号码精确查找 TODO：将统一使用listDepartmentMember接口，该接口暂停使用
export function findDepartmentMember(params: { telephone?: string }) {
  return http.request({
    url: "/api/crm/v1/findDepartmentMember",
    method: "get",
    params,
  });
}
// 查询用户权限
export function getAuthority(params: { id: string }) {
  return http.request({
    url: `/api/auth/v1/fxAuthPolicyOp/${params.id}`,
    method: "get",
  });
}
