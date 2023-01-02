export interface BasicUserDetail {
  userId: string;
  avatar: string;
  realName: string;
}

export interface BasicGroupDetail {
  groupId: string;
  iconUrl: string;
  name: string;
  isOfficial: number;
}

export interface BasicRobotDetail {
  code: string;
  iconUrl: string;
  name: string;
}
