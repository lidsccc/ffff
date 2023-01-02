import { http } from "@/utils/http/axios";

export enum FeedbackType {
  problem = 1,
  proposal = 0,
}
export type getFeedbackListParams = {
  id?: string;
  type?: FeedbackType;
  status?: number;
  createTime?: any;
  pageNum?: number;
  pageSize?: number;
};

export type createFeedbackParams = {
  type: FeedbackType;
  content: string;
  file?: string;
};

export type editFeedbackParams = {
  id: string;
  type: FeedbackType;
  content: string;
  file?: string;
  status?: number;
};

export function getFeedbackList(params: getFeedbackListParams) {
  return http.request({
    url: "/api/data/v1/fxFeedback",
    method: "get",
    params,
  });
}

export function createFeedback(params: createFeedbackParams) {
  return http.request({
    url: "/api/data/v1/fxFeedback",
    method: "post",
    params,
  });
}

export function getFeedbackDetail(params: { id: string }) {
  return http
    .request({
      url: `/api/task/v1/fxFeedback/${params.id}`,
      method: "get",
    })
    .then((data) => {
      Object.keys(data).forEach((key) => {
        if (data[key] == null) {
          data[key] = undefined;
        }
      });
      return data;
    });
}

export function editFeedback(params: editFeedbackParams) {
  return http.request({
    url: "/api/task/v1/fxFeedback",
    method: "put",
    params,
  });
}

export function deleteFeedback(params: { id: string }) {
  return http.request({
    url: `/api/task/v1/fxFeedback/${params.id}`,
    method: "delete",
  });
}
