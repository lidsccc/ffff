import { ipcMain, shell } from "electron";
import { OPEN_WEBSITE } from "../channel";

export function registerOpenWebsite() {
  ipcMain.on(OPEN_WEBSITE, (event, url: string) => {
    shell.openExternal(url);
  });
}
