import "./styles/tailwind.css";
import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
// @ts-ignore
import contextmenu from "v-contextmenu";
// @ts-ignore
import VirtualList from "vue-virtual-list-v3";
import "v-contextmenu/dist/themes/default.css";
import App from "./App.vue";
import store from "./store";
import { router } from "./router";
import * as Icons from "@element-plus/icons-vue";
import { ROUTE_HASH } from "../../main/channel";

const app = createApp(App);

// 注册Icons 全局组件
Object.keys(Icons).forEach((key) => {
  // @ts-ignore
  app.component(key, Icons[key]);
});

// 挂载状态管理
app.use(store);

// 挂载路由
app.use(router);

app.use(ElementPlus, {
  locale: zhCn,
});

app.use(contextmenu);
app.use(VirtualList);

app.config.errorHandler = (err, vm, info) => {
  console.error("[全局异常]", err, vm, info);
};

app.mount("#app", true).$nextTick(window.removeLoading);

// Usage of ipcRenderer.on
window.ipcRenderer.on("main-process-message", (_event, ...args) => {
  console.log("[Receive Main-process message]:", ...args);
});

window.ipcRenderer.on(ROUTE_HASH, (_event, hash: string) => {
  location.hash = hash;
});
