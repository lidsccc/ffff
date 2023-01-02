import { ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import { OPEN_FILE_SELECT_DIALOG } from "../channel";

export function registerOpenFileSelectDialog() {
  ipcMain.handle(OPEN_FILE_SELECT_DIALOG, async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      // 限制能够选择的文件类型
      // filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
      properties: ["openFile"],
    });
    if (canceled) {
      return;
    } else {
      const filePath = filePaths[0];
      const stats = fs.statSync(filePath);
      return { filePath, fileName: path.basename(filePath), size: stats.size };
    }
  });
}
