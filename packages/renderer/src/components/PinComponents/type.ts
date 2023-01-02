// import { sendTimeType } from "@/enums/pin";
export interface PinListParams {
  creator?: string;
  remindTime?: string;
  isFinished?: number;
  repeatIn?: string;
  isDel?: number;
  pageNum: number;
  pageSize?: number;
  type?: number;
}
export interface CreatePinParams {
  content: string;
  attachments?: any;
  users: { userId: string }[];
  remindTime?: string;
  magicwords?: string;
  repeatIn?: number;
  noticeType: string;
}
