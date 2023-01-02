import { defineStore } from "pinia";

export interface UserDetail {
  departmentId: string;
  departmentName: string;
  email: string;
  extension: object;
  gender: number;
  iconUrl: string;
  id: string;
  joinTime: number;
  name: string;
  nickName: string;
  officeLocation: string;
  superior: string;
  superiorName: string;
  telephone: string;
  types: number[];
  workId: string;
}

export interface UserState {
  accountType: number;
  avatar: string;
  birthday: number;
  createTime: number;
  email: string;
  gender: number;
  isDel: number;
  nickName: string;
  realName: string;
  telephone: string;
  updateTime: number;
  userId: string;
  accessToken: string;
  refreshToken: string;
  detail: UserDetail;
}

const defaultUserData = {
  accountType: 1,
  avatar: "",
  birthday: 0,
  createTime: 0,
  email: "",
  gender: 0,
  isDel: 0,
  nickName: "",
  realName: "",
  telephone: "",
  updateTime: 0,
  userId: "",
  accessToken: "",
  refreshToken: "",
  detail: {
    departmentId: "",
    departmentName: "",
    email: "",
    extension: {},
    gender: 0,
    iconUrl: "",
    id: "",
    joinTime: 0,
    name: "",
    nickName: "",
    officeLocation: "",
    superior: "",
    superiorName: "",
    telephone: "",
    types: [],
    workId: "",
  },
};

export const useUserStore = defineStore({
  id: "user", // id 必填且需要唯一

  state: (): UserState => {
    return defaultUserData;
  },

  getters: {
    firstName: (state) => {
      return state.realName[0] || "";
    },
  },

  actions: {
    setUser(user: UserState) {
      Object.keys(user).forEach((key) => {
        // @ts-ignore
        this[key] = user[key];
      });
    },
    updateAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setDetail(detail: UserDetail) {
      this.detail = detail;
    },
    clear() {
      Object.keys(defaultUserData).forEach((key) => {
        // @ts-ignore
        this[key] = defaultUserData[key];
      });
    },
  },

  // 开启数据缓存
  persist: {
    storage: window.localStorage,
  },
});
