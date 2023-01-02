import fs from "fs";
import { contextBridge, ipcRenderer } from "electron";
import { domReady } from "./utils";
import { useLoading } from "./loading";
import log from "./log";
const ImRender = require("@iflytek/im-electron-sdk/fim-electron-sdk/dist/renderer");

const imRender = new ImRender();

const { appendLoading, removeLoading } = useLoading();

(async () => {
  await domReady();

  appendLoading();
})();

// 插入一个可以移动的dom
function initDragDiv({ width, height }: { width: string; height: string }) {
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "0";
  div.style.height = height;
  div.style.width = width;
  div.style.zIndex = "9999";
  div.style.pointerEvents = "none"; // 用于点击穿透
  // @ts-ignore
  div.style["-webkit-user-select"] = "none"; // 禁止选择文字
  // @ts-ignore
  div.style["-webkit-app-region"] = "drag"; // 拖动
  document.body.appendChild(div); // 添加节点
}
window.addEventListener("DOMContentLoaded", function onDOMContentLoaded() {
  if (process.platform === "darwin") {
    initDragDiv({ width: "calc(100% - 90px)", height: "60px" });
    initDragDiv({ width: "64px", height: "100%" });
  } else {
    // TODO:windows下设置的点击穿透未生效，所以设置一个未覆盖操作区的位置来拖动
    initDragDiv({ width: "calc(100% - 90px)", height: "20px" });
    initDragDiv({ width: "64px", height: "52px" });
  }
});

// --------- Expose some API to the Renderer process. ---------
contextBridge.exposeInMainWorld("fs", fs);
contextBridge.exposeInMainWorld("removeLoading", removeLoading);
contextBridge.exposeInMainWorld("ipcRenderer", withPrototype(ipcRenderer));
contextBridge.exposeInMainWorld("$log", withPrototype(log));
contextBridge.exposeInMainWorld("$platform", process.platform);
contextBridge.exposeInMainWorld("$imRender", withPrototype(imRender));

// `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
function withPrototype(obj: Record<string, any>) {
  const protos = Object.getPrototypeOf(obj);

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue;

    if (typeof value === "function") {
      // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
      obj[key] = function (...args: any) {
        return value.call(obj, ...args);
      };
    } else {
      obj[key] = value;
    }
  }
  return obj;
}
