<template>
  <div class="w-full">
    <ContactTitle :title="'我的群组'" :showCreateGroup="true" />
    <groupIndex />
  </div>
</template>

<script lang="ts" setup>
import groupIndex from "@/components/Group/groupIndex.vue";
import ContactTitle from "@/components/ContactTitle/ContactTitle.vue";

import { provide } from "vue";

let checkable = false;
provide("checkable", checkable);
</script>

<style scoped>
:deep(.contact-title) {
  border: none;
}
</style>
