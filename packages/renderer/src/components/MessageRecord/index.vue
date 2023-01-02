<template>
  <div class="w-[320px] flex-shrink-0 h-full flex flex-col bg-white">
    <MessageSearch />
    <MessageList />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageRecord",
});
</script>

<script lang="ts" setup>
import MessageSearch from "./MessageSearch.vue";
import MessageList from "./MessageList.vue";
</script>

<style lang="less" scoped></style>
