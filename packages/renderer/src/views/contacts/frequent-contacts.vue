<template>
  <div class="w-full">
    <ContactTitle :title="'常用联系人'" />

    <FrequentContacts />
  </div>
</template>

<script lang="ts" setup>
import FrequentContacts from "@/components/FrequentContacts/index.vue";
import { provide } from "vue";
import ContactTitle from "@/components/ContactTitle/ContactTitle.vue";

let checkable = false;
provide("checkable", checkable);
</script>

<style></style>
