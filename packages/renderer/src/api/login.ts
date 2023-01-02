import { http } from "@/utils/http/axios";

export const loginApi = "/api/sso/v3/login";
export const refreshApi = "/api/sso/v3/extendTokenTime";
export const applyToUpdatePasswordApi = "/api/crm/v1/applyToUpdatePassword";

export interface Account {
  username: string;
  password: string;
}

export function login(params: Account) {
  return http.request({
    url: loginApi,
    method: "post",
    params,
  });
}

export function refreshToken() {
  return http.request({
    url: refreshApi,
    method: "get",
  });
}

export function logout(params: { userId: string }) {
  return http.request({
    url: "/api/sso/v3/logout",
    method: "post",
    params,
  });
}

export function applyToUpdatePassword(params: { password: string }) {
  return http.request(
    {
      url: applyToUpdatePasswordApi,
      method: "get",
      params,
    },
    {
      isShowErrorMessage: false,
    }
  );
}

export function updatePassword(params: { password: string }) {
  return http.request({
    url: "/api/crm/v2/updatePassword",
    method: "post",
    params,
  });
}
