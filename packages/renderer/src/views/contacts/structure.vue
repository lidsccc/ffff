<template>
  <div class="w-full">
    <ContactTitle :title="structureStore.rootDepartment?.name" />

    <div class="h-5/6">
      <CompanyStructure
        :childDepartId="departDetailId"
        :selectedUserId="selectedUserId"
        :date="date"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import CompanyStructure from "@/components/Structure/index.vue";
import { ref, provide, watch } from "vue";
import { useRoute } from "vue-router";
import ContactTitle from "@/components/ContactTitle/ContactTitle.vue";
import { useStructureStore } from "@/store/modules/contacts";
const structureStore = useStructureStore();

let checkable = false;
provide("checkable", checkable);

const departDetailId = ref(""); // 组织id
const selectedUserId = ref(""); // 被搜索人的id
const date = ref(""); //  通过date判断是否有搜索操作
let route = useRoute();
departDetailId.value = route.query.id;
selectedUserId.value = route.query.selectedUserId;
if (route.query.selectedUserId) {
  selectedUserId.value = route.query.selectedUserId;
}
watch(
  () => route.query,
  () => {
    departDetailId.value = route.query.id;
    date.value = route.query.date;
    selectedUserId.value = route.query.selectedUserId;
  }
);
</script>
<style scoped></style>
