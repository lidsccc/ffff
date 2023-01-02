import { app, ipcMain, globalShortcut } from "electron";
import path from "path";
import fs from "fs";
import { format } from "date-fns";
import log from "../../preload/log";
import pkg from "../../../package.json";
import {
  SCREENSHOTS,
  SEND_SCREENSHOT_IMG,
  REGISTER_SCREENSHOTS,
  QUICK_SCREENSHOTS,
} from "../channel";
import { DEFAULT_SCREENSHOTS_KEY } from "../../renderer/src/constant/message";

export function registerScreenshots(win: any) {
  const Screenshots = require("electron-screenshots").default;
  const screenshots = new Screenshots();
  // 注册截屏快捷键
  globalShortcut.register(`CmdOrCtrl+Shift+${DEFAULT_SCREENSHOTS_KEY}`, () => {
    screenshots.startCapture();
  });
  globalShortcut.register("Esc", () => {
    if (screenshots) {
      screenshots.endCapture();
    }
  });
  const screenshotsDir = path.join(
    app.getPath("appData"),
    pkg.name,
    "screenshots"
  );
  log.info("截图文件夹路径", screenshotsDir);
  const isScreenshotsDirExists = fs.existsSync(screenshotsDir);
  if (!isScreenshotsDirExists) {
    try {
      fs.mkdirSync(screenshotsDir);
    } catch (err: any) {
      log.error("创建截图文件夹", err);
    }
  }

  const getScreenshotsName = () => {
    const time = Date.now();
    const screenshotsName = `FX${format(time, "yyyyMMdd")}-${String(time).slice(
      7
    )}`;
    return screenshotsName;
  };

  const getScreenshotsPath = (screenshotsDir: string) => {
    const screenshotsName = getScreenshotsName();
    const screenshotsPath = path.join(screenshotsDir, `${screenshotsName}.png`);
    return screenshotsPath;
  };

  // 点击确定按钮回调事件
  screenshots.on("ok", (e: any, buffer: any) => {
    // console.log("ok", buffer, bounds);

    // 获取截图base64
    // const base64Img =
    //   "data:image/png;base64," +
    //   btoa(
    //     new Uint8Array(buffer).reduce(
    //       (data, byte) => data + String.fromCharCode(byte),
    //       ""
    //     )
    //   );

    const screenshotsPath = getScreenshotsPath(screenshotsDir);
    log.info("screenshotsPath", screenshotsPath);
    fs.writeFileSync(screenshotsPath, Buffer.from(buffer));
    win.webContents.send(SEND_SCREENSHOT_IMG, { screenshotsPath });
  });
  // 点击取消按钮回调事件
  screenshots.on("cancel", () => {
    console.log("cancel", "cancel");
  });
  // 点击保存按钮回调事件
  screenshots.on("save", (e: any, buffer: any, bounds: any) => {
    console.log("save", buffer, bounds);
    // dialog
    //   .showSaveDialog(win, {
    //     title: "保存截图",
    //     defaultPath: `${getScreenshotsName()}.png`,
    //     filters: [{ name: "Images", extensions: ["png"] }],
    //   })
    //   .then(({ canceled, filePath }) => {
    //     if (canceled) return;
    //     console.log("screenshotsPath", filePath);
    //     fs.writeFileSync(filePath as string, Buffer.from(buffer));
    //   });
  });
  ipcMain.on(SCREENSHOTS, () => {
    if (screenshots) {
      screenshots.startCapture();
    }
  });
  ipcMain.on(REGISTER_SCREENSHOTS, async (_e, oldKey, newKey) => {
    if (globalShortcut.isRegistered(`CmdOrCtrl+Shift+${oldKey}`)) {
      globalShortcut.unregister(`CmdOrCtrl+Shift+${oldKey}`);
    }
    globalShortcut.register(`CmdOrCtrl+Shift+${newKey}`, () => {
      win.webContents.send(QUICK_SCREENSHOTS);
    });
  });
}
