import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { createRouterGuards } from "./router-guards";
import Login from "@/views/login/index.vue";
import Layout from "@/layout/index.vue";
import ErrorPage from "@/views/404/index.vue";
import MergerMessage from "@/views/merger-message/index.vue";
import UpdatePage from "@/views/update/index.vue";
import VideoPlay from "@/views/video-play/index.vue";

const modules = import.meta.globEager("./modules/**/*.ts");

const routes: RouteRecordRaw[] = [];

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routes.push(...modList);
});

// @ts-ignore
function sortRoute(a, b) {
  return (a.meta?.sort || 0) - (b.meta?.sort || 0);
}

routes.sort(sortRoute);

const loginRoute = {
  path: "/",
  component: Login,
};

const mergerMessageRoute = {
  path: "/merger-message",
  component: MergerMessage,
};
const videoPlayRoute = {
  path: "/video-play",
  component: VideoPlay,
};
const updateRoute = {
  path: "/update",
  component: UpdatePage,
};

const errorRoute = {
  path: "/:path(.*)*",
  component: Layout,
  children: [
    {
      path: "/:path(.*)*",
      component: ErrorPage,
    },
  ],
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    loginRoute,
    mergerMessageRoute,
    videoPlayRoute,
    updateRoute,
    ...routes,
    errorRoute,
  ],
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 创建路由守卫
createRouterGuards(router);

export { routes, router };
