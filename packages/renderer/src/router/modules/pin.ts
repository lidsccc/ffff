import { RouteRecordRaw } from "vue-router";
import Layout from "@/layout/index.vue";
import Pin from "@/views/pin/index.vue";
import PinIcon from "@/assets/pin.png";
import ActivePinIcon from "@/assets/pin-active.png";

const routeName = "pin";

/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时, 自动进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 * */
const routes: Array<RouteRecordRaw> = [
  {
    path: `/${routeName}`,
    name: routeName,
    redirect: `/${routeName}/main`,
    component: Layout,
    meta: {
      title: "pin通知",
      icon: PinIcon,
      activeIcon: ActivePinIcon,
      sort: 5,
    },
    children: [
      {
        path: "main",
        name: `${routeName}_main`,
        component: Pin,
      },
    ],
  },
];

export default routes;
