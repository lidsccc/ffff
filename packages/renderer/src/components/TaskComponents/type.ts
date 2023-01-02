export interface SubTaskParams {
  name: string;
  deadline: number;
  userIds: string[];
  attachments: { name: string; attachmentUrl: string }[];
}
export interface CreateTaskParams extends SubTaskParams {
  shareUserIds?: string[];
  remark?: string;
  actionVos?: SubTaskParams[];
  id?: string;
}
export interface taskDetail {
  attachments?: any[];
  closeTime?: number;
  createGroup?: number;
  createTime: number;
  creator: string;
  creatorVo: any;
  deadline: number;
  finishTime: number;
  gourpId: string;
  id: string;
  moreInfo?: string;
  name: string;
  progress?: number;
  remark: string;
  shareUsers?: any[];
  status: number;
  updateTime?: number;
  users: any[];
}
export interface subTaskDeatil {
  attachments: any[];
  createTime: number;
  deadline: number;
  execInfo?: string;
  id: string;
  name: string;
  progress: number;
  updateTime: number;
  users: any[];
}

export interface taskDetailData {
  taskDetail: taskDetail;
}

export interface selectedUser {
  id: string;
  name: string;
  iconUrl: string;
}
