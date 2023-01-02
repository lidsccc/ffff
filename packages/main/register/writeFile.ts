import { app, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { format } from "date-fns";
import log from "../../preload/log";
import { WRITE_FILE } from "../channel";
import pkg from "../../../package.json";

export function registerWriteFile() {
  ipcMain.handle(WRITE_FILE, (event, data: any) => {
    const tmpDir = path.join(app.getPath("appData"), pkg.name, "tmp");
    const isExists = fs.existsSync(tmpDir);
    if (!isExists) {
      try {
        fs.mkdirSync(tmpDir);
      } catch (err: any) {
        log.error("创建临时文件夹失败", err);
        return;
      }
    }
    const time = Date.now();
    const name = `tmp_${format(time, "yyyyMMdd")}-${String(time).slice(7)}`;
    const imgPath = path.join(tmpDir, `${name}.jpeg`);
    fs.writeFileSync(
      imgPath,
      Buffer.from(
        data.replace(/^data:image\/(png|gif|jpeg);base64,/, ""),
        "base64"
      )
    );
    return imgPath;
  });
}
