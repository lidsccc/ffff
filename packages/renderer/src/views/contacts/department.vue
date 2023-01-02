<template>
  <div class="w-full">
    <ContactTitle :title="structureStore.rootDepartment?.name" />
    <div>
      <MyDepartment />
    </div>
  </div>
</template>

<script lang="ts" setup>
import MyDepartment from "@/components/MyDepartment/index.vue";
import ContactTitle from "@/components/ContactTitle/ContactTitle.vue";

import { provide } from "vue";
import { useStructureStore } from "@/store/modules/contacts";
const structureStore = useStructureStore();

let checkable = false;
provide("checkable", checkable);
</script>
<style scoped></style>
