import { defineStore } from "pinia";
import { getPinlList } from "@/api/pin";
import { useUserStore } from "@/store/modules/user";
import { PinType } from "@/enums/pin";
import { getOperateAuthority } from "@/api/authority";

export interface SelectedUser {
  id: string;
  name: string;
  iconUrl: string;
  isGroup?: boolean;
}

export const useGlobalStore = defineStore({
  id: "global", // id 必填且需要唯一

  state: (): {
    selectedUserList: SelectedUser[];
    selectDisableList: any[];
    hasInitSDK: boolean;
    isImSDKOffline: boolean;
    isNetworkOffline: boolean;
    pinBadge: number;
    operateAuthority: number[];
  } => {
    return {
      selectedUserList: [],
      selectDisableList: [],
      hasInitSDK: false,
      isImSDKOffline: false, // im sdk 长链接断开
      isNetworkOffline: false, // 网络断开链接
      pinBadge: 0, // 未回执pin数量
      operateAuthority: [],
    };
  },

  getters: {},

  actions: {
    setSelectedUserList(list: SelectedUser[]) {
      this.selectedUserList = list;
    },
    //选择联系人
    addSelectedUser(contact: SelectedUser) {
      if (!this.selectedUserList.find((item) => item.id === contact.id)) {
        this.selectedUserList = [...this.selectedUserList, contact];
      }
    },
    //取消选择
    delSelectedUser(contact: SelectedUser) {
      this.selectedUserList = this.selectedUserList.filter(
        (i) => i.id !== contact.id
      );
    },
    //清空仓库
    clearSelectedUser() {
      this.selectedUserList = [];
    },
    //添加禁止选项
    addSelectDisableList(contact: any) {
      this.selectDisableList = contact;
    },
    //清空禁止项
    clearSelectDisableList() {
      this.selectDisableList = [];
    },
    setIsImSDKOffline(isImSDKOffline: boolean) {
      this.isImSDKOffline = isImSDKOffline;
    },
    setIsNetworkOffline(isNetworkOffline: boolean) {
      this.isNetworkOffline = isNetworkOffline;
    },
    updatePinBadge() {
      getPinlList({ type: PinType.UNREPEAT })
        .then((res) => {
          this.pinBadge = res.total;
        })
        .catch((err) => {
          window.$log.error("请求pin列表失败:", err);
        });
    },
    fetchOperateAuthority() {
      const userStore = useUserStore();
      getOperateAuthority({ id: userStore.userId })
        .then((res) => {
          this.operateAuthority = res;
        })
        .catch((err) => {
          window.$log.error("请求权限列表失败:", err);
        });
    },
  },
});
