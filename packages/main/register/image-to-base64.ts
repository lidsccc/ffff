import { ipcMain } from "electron";
import { IMAGE_TO_BASE64 } from "../channel";
const imageToBase64 = require("image-to-base64");
import log from "../../preload/log";

export function registerImageToBase64() {
  ipcMain.handle(IMAGE_TO_BASE64, async (event: any, url: string) => {
    try {
      return await imageToBase64(url);
    } catch (err) {
      log.error("imageToBase64", err);
      return url;
    }
  });
}
