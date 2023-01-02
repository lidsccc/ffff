import { http } from "@/utils/http/axios";

// 获得用户操作权限
export function getOperateAuthority(params: { id: string }) {
  return http.request({
    url: `/api/auth/v1/fxAuthUserOp/getMyOp/${params.id}`,
    method: "get",
  });
}
