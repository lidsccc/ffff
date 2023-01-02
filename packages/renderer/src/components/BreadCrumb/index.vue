<template>
  <div v-if="!props.checkable">
    <span
      v-for="(item, i) in crumb.crumbArr"
      :key="item.id"
      @click="getChildNode(item)"
      :class="i == crumb.crumbArr.length - 1 ? 'uncheckable' : 'checkable'"
    >
      {{ item.name }}
      <span class="pl-2 pr-2" v-if="i != crumb.crumbArr.length - 1">></span>
    </span>
  </div>
  <div v-else>
    <span
      v-for="(item, i) in crumb.crumbArr"
      :key="item.id"
      class="uncheckable"
    >
      {{ item.name }}
      <span class="pl-2 pr-2 uncheckable" v-if="i != crumb.crumbArr.length - 1"
        >></span
      >
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "BreadCrumb",
});
</script>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { StructureItemData } from "@/components/UserList/type";
import { useStructureStore } from "@/store/modules/contacts";
import { ROOT_DEPARTMENT_ID } from "@/constant/contact";
const structureStore = useStructureStore();

interface Props {
  departmentID: string;
  checkable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  departmentID: ROOT_DEPARTMENT_ID,
});

const crumb = reactive({
  // 路径数组
  crumbArr: [],
});

const getNode = (curId: string) => {
  const curStructure = structureStore.wholeStructureList.find(
    (item: StructureItemData) => item.id === curId
  );
  if (curStructure) {
    const { parentId } = curStructure;
    crumb.crumbArr.push(curStructure);
    if (parentId === ROOT_DEPARTMENT_ID) {
      crumb.crumbArr.reverse();
    } else {
      getNode(parentId);
    }
  }
};
getNode(props.departmentID);

watch(
  () => props.departmentID,
  () => {
    crumb.crumbArr = [];
    getNode(props.departmentID);
  }
);

//点击面包屑，跳转到组织架构并更新列表
const emitChildNode = defineEmits(["getChildNode"]);
const getChildNode = (val) => {
  emitChildNode("getChildNode", val);
};
//获得整体架构
</script>

<style scoped>
.checkable {
  color: var(--theme-color);
  cursor: pointer;
}
.uncheckable {
  color: var(--theme-text-gray);
}
</style>
