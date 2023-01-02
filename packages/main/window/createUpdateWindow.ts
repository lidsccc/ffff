import { app, BrowserWindow, ipcMain, shell } from "electron";
import { platform } from "os";
const path = require("path");
const fs = require("fs");
const request = require("request");
const progress = require("request-progress");
const semver = require("semver");
import pkg from "../../../package.json";
import { ROUTE_HASH, VERSION_CHECK, HAS_NEW_VERSION } from "../channel";
import log from "../../preload/log";

const update_server_url = "http://172.31.101.69:18088";

export function registerVersionCheck(globalWin: BrowserWindow | null) {
  ipcMain.on(VERSION_CHECK, async () => {
    createUpdateWindow(globalWin);
  });
}

export function createUpdateWindow(globalWin?: BrowserWindow | null) {
  request(
    `${update_server_url}/version`,
    function (err: any, res: any, body: any) {
      if (err) {
        log.error("createUpdateWindow error", err);
        return;
      }
      let version: any;
      try {
        version = JSON.parse(body).version;
      } catch (err: any) {
        log.error("解析更新版本信息出错", body, err);
      }

      if (!version || !semver.gt(version, pkg.version)) {
        // 没有新版本
        globalWin?.webContents.send(HAS_NEW_VERSION, false);
        return;
      }

      const updateWin = new BrowserWindow({
        width: 422,
        height: 600,
        show: false,
        frame: false,
        skipTaskbar: true,
        movable: true,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
          preload: path.join(__dirname, "../preload/index.cjs"),
          sandbox: false,
        },
      });
      if (app.isPackaged) {
        updateWin.loadFile(path.join(__dirname, "../renderer/index.html"));
      } else {
        const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}#update`;

        updateWin.loadURL(url);
        // updateWin.webContents.openDevTools();
      }

      updateWin.webContents.on("did-finish-load", () => {
        updateWin.webContents.send(ROUTE_HASH, "update");
        updateWin.webContents.send("UPDATE_VERSION", body);
        updateWin.show();
        globalWin?.webContents.send(HAS_NEW_VERSION, true);
      });

      ipcMain.on("CLOSE_UPDATE_WINDOW", () => {
        updateWin.hide();
      });

      ipcMain.on("UPDATE_APP", () => {
        const updateDir = path.join(app.getPath("appData"), pkg.name, "update");
        const isUpdateDirExists = fs.existsSync(updateDir);
        if (!isUpdateDirExists) {
          try {
            fs.mkdirSync(updateDir);
          } catch (err: any) {
            log.error("创建更新文件夹失败", err);
            return;
          }
        }
        const fileExt = platform() === "darwin" ? "dmg" : "exe";
        const fileName = `feixun_${version}.${fileExt}`;
        const downloadUrl = `${update_server_url}/release/${fileExt}/${version}`;

        // 更新包已存在
        const updatePkgPath = path.join(updateDir, fileName);
        const isUpdatePkgExists = fs.existsSync(updatePkgPath);
        if (isUpdatePkgExists) {
          updateWin.webContents.send("UPDATE_END");
          shell.showItemInFolder(path.join(updateDir, fileName));
          return;
        }

        const writeStream = fs.createWriteStream(
          path.join(updateDir, fileName)
        );
        progress(request(downloadUrl))
          .on("progress", function (state: any) {
            updateWin.webContents.send("UPDATE_PROGRESS", state);
          })
          .on("error", function (err: any) {
            log.error("下载更新包出错", err);
            updateWin.webContents.send("UPDATE_ERROR", err);
          })
          .on("end", function () {
            updateWin.webContents.send("UPDATE_END");
            shell.showItemInFolder(path.join(updateDir, fileName));
          })
          .pipe(writeStream);
      });
    }
  );
}
