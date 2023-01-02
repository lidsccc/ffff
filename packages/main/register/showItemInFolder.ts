import { ipcMain, shell } from "electron";
import { SHOW_ITEM_IN_FOLDER } from "../channel";

export function registerShowItemInFolder() {
  ipcMain.on(SHOW_ITEM_IN_FOLDER, (event, fullPath: string) => {
    shell.showItemInFolder(fullPath);
  });
}
