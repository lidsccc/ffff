export enum MessageType {
  Text = "text",
  File = "file",
  Image = "image",
}

export enum MessageOperationStatus {
  Input = "input",
  Select = "select",
}

export type MessageBubbleType = {
  id: number;
  fromOther: boolean;
  avatar: string;
  content: string;
  type: MessageType;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  hasRead?: boolean;
};
