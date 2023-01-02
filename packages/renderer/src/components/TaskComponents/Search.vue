<template>
  <div class="message-search flex items-center">
    <!-- <el-input v-model="input" placeholder="请输入搜索内容" /> -->

    <!-- <el-tooltip effect="light" content="创建任务" placement="bottom"> -->
    <!-- <img
        src="@/assets/add-icon.png"
        class="w-6 h-6 ml-2 cursor-pointer"
        @click="handleVisibleChange(true)"
      /> -->
    <div class="button-wrap">
      <el-button :icon="Plus" @click="handleVisibleChange(true)"
        >创建任务</el-button
      >
    </div>
    <!-- </el-tooltip> -->
  </div>

  <div v-if="data.dialogVisible">
    <CreatTaskDialog
      :visible="data.dialogVisible"
      @on-hide="data.dialogVisible = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  name: "TaskSearch",
});
</script>

<script lang="ts" setup>
import { Plus } from "@element-plus/icons-vue";
// import { ref } from "vue";
import CreatTaskDialog from "@/components/TaskComponents/CreatTaskDialog.vue";
// const input = ref("");
const data = reactive({
  dialogVisible: false,
  createType: false,
});
const handleVisibleChange = (visible: boolean) => {
  data.dialogVisible = true;
};
</script>

<style lang="less" scoped>
.message-search {
  height: var(--content-header-height);
  box-sizing: border-box;
  // padding: 20px 14px;
  background: #fff;
  // :deep(.el-autocomplete) {
  //   width: 300px;
  // }
}
.button-wrap {
  padding: 25px 20px 7px 20px;
  :deep(.el-button) {
    width: 12rem;
  }
}
</style>

<style lang="less">
.message-input-popper .el-autocomplete-suggestion li {
  width: 260px;
}
</style>
