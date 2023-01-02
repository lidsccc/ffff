import { ipcMain } from "electron";
import { CHECK_WINDOW_VISIBLE } from "../channel";

export function registerCheckWindowVisible(win: any) {
  ipcMain.handle(CHECK_WINDOW_VISIBLE, () => {
    return win.isVisible() && !win.isMinimized();
  });
}
