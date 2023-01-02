import { http } from "@/utils/http/axios";
import { PinType } from "@/enums/pin";

//pin列表
export function getPinlList(params: {
  creator?: string;
  remindTime?: string;
  isFinished?: number;
  repeatIn?: string;
  isDel?: number;
  pageNum?: number;
  pageSize?: number;
  type?: PinType;
}) {
  return http.request({
    url: "/api/task/v1/fxPin/my",
    method: "get",
    params,
  });
}
// 创建Pin消息
export function createPin(params: {
  content: string;
  attachments: any;
  users: { userId: string }[];
  remindTime?: string;
  magicwords?: string[];
  repeatIn?: number;
  noticeType: string[];
}) {
  return http.request({
    url: "/api/task/v1/fxPin",
    method: "post",
    params,
  });
}
// 获得pin消息详情
export function getPinDetail(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxPin/${params.id}`,
    method: "get",
  });
}

// 删除pin
export function delPin(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxPin/${params.id}`,
    method: "delete",
  });
}
//回执Pin消息
export function receiptPin(params: { id: string; magicword: string }) {
  return http.request({
    url: `/api/task/v1/fxPin/receipt/${params.id}?magicword=${params.magicword}`,
    method: "put",
  });
}
// 获得pin消息详情
export function getPinStatus(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxPin/export/${params.id}`,
    method: "get",
  });
}
