import { ipcMain, BrowserWindow } from "electron";
import { PLAY_VIDEO_DATA, SHOW_VIDEO_PLAY, CLOSE_VIDEO_PLAY } from "../channel";

export function registerVideoPlay(videoPlayWin: BrowserWindow | null) {
  ipcMain.handle(SHOW_VIDEO_PLAY, async (e, videoPath) => {
    videoPlayWin?.show();
    videoPlayWin?.webContents.send(PLAY_VIDEO_DATA, videoPath);
  });

  ipcMain.handle(CLOSE_VIDEO_PLAY, () => {
    videoPlayWin?.close();
  });
}
