<template>
  <div class="h-full flex justify-center items-center bg-white">
    <el-result title="404" sub-title="对不起，请求错误">
      <template #icon>
        <div class="flex justify-center">
          <img src="@/assets/login-bg.png" class="w-6/12" />
        </div>
      </template>
      <template #extra>
        <el-button type="primary" @click="handleBack">返回</el-button>
      </template>
    </el-result>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const router = useRouter();

const handleBack = () => {
  router.back();
};
</script>

<style lang="less" scoped></style>
