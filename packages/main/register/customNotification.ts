import { app, ipcMain, BrowserWindow, screen } from "electron";
import { platform } from "os";
import { join } from "path";
import {
  AUDIO_OR_VIDEO_REQUEST,
  HAND_UP_AUDIO_OR_VIDEO_REQUEST,
  ANSWER_AUDIO_OR_VIDEO_REQUEST,
  REPLY_AUDIO_OR_VIDEO_REQUEST,
  CLOSE_AUDIO_OR_VIDEO_SMALL_DIALOG,
} from "../channel";

export function registerAudioOrVideoRequest(globalWin: any) {
  let win: any;
  ipcMain.handle(AUDIO_OR_VIDEO_REQUEST, async (event, data) => {
    win = new BrowserWindow({
      width: 360,
      height: 100,
      // width: 660,
      // height: 400,
      show: false,
      x: 0,
      y: 0,
      frame: false, // 无边框
      skipTaskbar: true, // 使窗口不显示在任务栏中
      movable: false, // 禁止窗口被用户移动
      resizable: false, // 禁止窗口手动调整窗口大小
      fullscreenable: false, // 禁止窗口可以进入全屏状态
      alwaysOnTop: true, // 窗口是否永远在别的窗口的上面
      webPreferences: {
        preload: join(__dirname, "../preload/index.cjs"),
        sandbox: false,
      },
    });
    if (app.isPackaged) {
      win.loadFile(join(__dirname, "../renderer/html/customNotification.html"));
    } else {
      win.loadFile(
        join(
          __dirname,
          "../../packages/renderer/public/html/customNotification.html"
        )
      );
    }
    // 定位到桌面右上角
    const { workAreaSize } = screen.getPrimaryDisplay();
    const [cwidth = 0, cheight = 0] = win.getContentSize();
    const left = workAreaSize.width - cwidth - 10;
    const top =
      platform() === "darwin" ? 30 : workAreaSize.height - cheight - 10; // mac显示在右上角，Windows显示在右下角
    win.setPosition(left, top);
    win.showInactive(); // 显示但不聚焦于窗口（建议做延时处理）
    // win.webContents.openDevTools();

    win.webContents.on("did-finish-load", () => {
      win?.webContents.send(AUDIO_OR_VIDEO_REQUEST, data);
    });
  });

  ipcMain.handle(CLOSE_AUDIO_OR_VIDEO_SMALL_DIALOG, () => {
    if (win) {
      win.close();
    }
  });

  ipcMain.handle(HAND_UP_AUDIO_OR_VIDEO_REQUEST, () => {
    globalWin.webContents.send(REPLY_AUDIO_OR_VIDEO_REQUEST, false);
    if (win) {
      win.close();
    }
  });

  ipcMain.handle(ANSWER_AUDIO_OR_VIDEO_REQUEST, () => {
    globalWin.webContents.send(REPLY_AUDIO_OR_VIDEO_REQUEST, true);
    globalWin.show();
    if (win) {
      win.close();
    }
  });
}
