<template>
  <el-container class="layout-page-container">
    <el-aside class="layout-aside">
      <SideMenu />
    </el-aside>
    <el-main class="layout-main">
      <div v-if="isWindows" class="window-size-wapper">
        <WindowSize />
      </div>
      <RouterView />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SideMenu from "./SideMenu.vue";
import WindowSize from "./WindowSize.vue";

const isWindows = computed(() => window["$platform"] === "win32");
</script>

<style lang="less" scoped>
.layout-page-container {
  height: 100vh;
  overflow: hidden;
  .layout-aside {
    width: var(--layout-aside-width);
    height: 100%;
    background: linear-gradient(180deg, #edf0f0 0%, #eff3f4 100%);
  }
  .layout-main {
    height: 100%;
    padding: 0;
    overflow: hidden;
    position: relative;
    .window-size-wapper {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 10000;
    }
  }
}
</style>
