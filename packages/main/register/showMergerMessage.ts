import { ipcMain, BrowserWindow } from "electron";
import {
  SHOW_MERGER_MESSAGE,
  MERGER_MESSAGE_DATA,
  CLOSE_MERGER_MESSAGE,
} from "../channel";

export function registerShowMergerMessage(
  mergerMessageWin: BrowserWindow | null
) {
  ipcMain.handle(SHOW_MERGER_MESSAGE, async (e, data) => {
    mergerMessageWin?.show();
    mergerMessageWin?.webContents.send(MERGER_MESSAGE_DATA, data);
  });

  ipcMain.handle(CLOSE_MERGER_MESSAGE, () => {
    mergerMessageWin?.close();
  });
}
