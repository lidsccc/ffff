<template>
  <div class="flex h-full flex-row">
    <div class="h-full flex-col bg-white">
      <div class="search-wrap">
        <AutoCompleteSearch @on-select="handleSearchSelect" />
      </div>

      <el-menu
        v-if="temp"
        :default-active="currentRoute"
        class="el-menu-vertical-demo"
        router
        active-text-color="#00b0bb"
      >
        <el-menu-item
          v-for="item in contactRoutes"
          :index="item.path"
          :key="item.name"
        >
          <div class="flex items-center">
            <img :src="item.meta.icon" class="h-5 mr-2" />
            <div>{{ item.meta.title }}</div>
          </div>
        </el-menu-item>
      </el-menu>
    </div>
    <RouterView />
  </div>
</template>

<script lang="ts" setup>
import { routes } from "@/router";
import { ref, watch, computed, nextTick } from "vue";
import { get } from "lodash-es";
import { useRouter } from "vue-router";
import { ContactName } from "@/constant/contact";
import AutoCompleteSearch from "@/components/AutoCompleteSearch/index.vue";
const temp = ref(true);
let currentRoute = ref("structure");
const route = useRouter();

//监听页面路由变化，控制菜单active样式
watch(
  () => route.currentRoute.value,
  (n) => {
    if (n.fullPath.indexOf("structure") != -1) {
      temp.value = false;
      nextTick(() => {
        temp.value = true;
        currentRoute.value = "structure";
      });
    }
  }
);

// 找到通讯录下面的路由
let contactRoutes = computed(() => {
  const contact = routes.find((it) => it.name === ContactName);
  return get(contact, ["children", "0", "children"]);
});

// 选中搜索结果后,跳转到对应组织架构
const router = useRouter();
const handleSearchSelect = (item: any) => {
  router.push({
    path: "/contacts/main/structure",
    query: {
      id: item.departmentId,
      selectedUserId: item.id,
      date: new Date().getTime(),
    },
  });
};
</script>
<style>
/* 联系人模块header高度 */
.wrap {
  --contact-header-height: 68px;
}
</style>
<style lang="less" scoped>
.contact-list {
  @apply h-8 p-1 mb-2 leading-6 flex items-center cursor-pointer;
}
.el-menu {
  --el-menu-item-height: 40px;
  border: none;
  width: 95%;
}
.el-menu-item:hover {
  background-color: rgb(245, 245, 245);
  border-radius: 4px;
}
.el-menu-item {
  padding: 0 0 0 10px !important;
  box-sizing: border-box;
  margin-left: 10px;
}
.search-wrap {
  height: var(--content-header-height);
  padding: 10px 14px;
  width: 15rem;
}
</style>
