import { getDepartmentStructure } from "@/api/department";
import { StructureItemData } from "@/components/UserList/type";
import { defineStore } from "pinia";
import { ROOT_DEPARTMENT_ID } from "@/constant/contact";
export interface structureData {
  count: number;
  departmentId: string;
  pullTime: string;
  total: number;
  items: StructureItemData[];
}
const defaultStructureData = {
  count: 0,
  departmentId: "",
  pullTime: "",
  total: 0,
  items: [],
};
export const useStructureStore = defineStore({
  id: "structure", // id 必填且需要唯一

  state: (): {
    structureData: structureData;
    loading: boolean;
  } => {
    return { structureData: defaultStructureData, loading: false };
  },
  getters: {
    rootDepartment: (state) => {
      // 根部门
      return state.structureData.items.find(
        (item: StructureItemData) => item.parentId === ROOT_DEPARTMENT_ID
      );
    },
    wholeStructureList: (state) => {
      // 全量架构列表
      return state.structureData.items;
    },
    myDepartmentId: (state) => {
      // 用户的部门id
      return state.structureData.departmentId;
    },
  },

  actions: {
    fetchStructureData() {
      this.loading = true;
      getDepartmentStructure({
        parentId: ROOT_DEPARTMENT_ID,
      })
        .then((res: structureData) => {
          this.structureData = res;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
