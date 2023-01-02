import { defineStore } from "pinia";

export interface TestState {
  name: string;
  age: number;
}

export const useTestStore = defineStore({
  id: "test", // id 必填且需要唯一

  state: (): TestState => {
    return {
      name: "张三",
      age: 18,
    };
  },

  getters: {
    fullName: (state) => {
      return state.name + "丰";
    },
  },

  actions: {
    updateName(name: string) {
      this.name = name;
    },
  },

  // 开启数据缓存
  persist: {
    storage: window.localStorage,
    paths: ["name"],
  },
});
