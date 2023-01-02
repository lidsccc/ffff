import { http } from "@/utils/http/axios";

export function upload(params: any) {
  return http.request({
    url: "/api/resource/v1/upload",
    method: "post",
    params,
  });
}
