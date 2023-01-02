import {
  app,
  BrowserWindow,
  shell,
  dialog,
  ipcMain,
  globalShortcut,
  protocol,
} from "electron";
import { release, platform } from "os";
import { join } from "path";
import { setMenu } from "./setMenu";
import { registerScreenshots } from "./register/screenshots";
import { registerFileDownload } from "./register/downLoad";
import { registerOpenFileSelectDialog } from "./register/fileSelectDialog";
import { registerImageToBase64 } from "./register/image-to-base64";
import { registerAudioOrVideoRequest } from "./register/customNotification";
import { registerCheckWindowVisible } from "./register/checkWindowVisible";
import { registerShowMergerMessage } from "./register/showMergerMessage";
import { registerWriteFile } from "./register/writeFile";
import { registerVideoPlay } from "./register/videoPlay";
import { registerPcm2Wav } from "./register/pcm2wav";
import { registerShowItemInFolder } from "./register/showItemInFolder";
import { registerOpenWebsite } from "./register/openWebsite";
import { ROUTE_HASH } from "./channel";
import {
  createUpdateWindow,
  registerVersionCheck,
} from "./window/createUpdateWindow";
const ImMain = require("@iflytek/im-electron-sdk/fim-electron-sdk/dist/main");
import log from "../preload/log";

// console.log("versions", process.versions);

// mac im sdk 目前只支持11.3.1及以上系统
if (platform() === "darwin" && +release().split(".")[0] < 20) {
  dialog.showErrorBox(
    "macOS系统版本太低",
    "该应用支持11.3.1及以上系统，请升级您的系统版本"
  );
}

new ImMain({
  // systemVersion: platform() === "darwin" ? "macos" : "windows 10",
  systemVersion: "windows", // mac也传windows 为了服务端hack挤下线
  appID: "1g8snq6u4",
  appKey: "683d204e1d4a4c54a39025e6ebbe7308",
  appSercet: "Zp0mvQcJilbD21s7baUKVVJDcnOFJnDY",
  serverIP: "211.91.71.22", // im服务部署的IP
  serverPort: "30008", // im服务部署的端口号
  serverDomain: "", // im服务部署的域名；如果有优先使用域名否则使用IP+Port
  cloudStorageDomain: "http://211.91.71.22:9967", // 小文件服务部署的域名或者url
});

// const isDev = process.env.NODE_ENV === "development";

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
let mergerMessageWin: BrowserWindow | null = null;
let videoPlayWin: BrowserWindow | null = null;

const DEFAULT_WINDOW_SIZE = {
  width: !app.isPackaged ? 1280 : 980,
  height: 640,
};

async function createWindow() {
  win = new BrowserWindow({
    ...DEFAULT_WINDOW_SIZE,
    minWidth: DEFAULT_WINDOW_SIZE.width,
    minHeight: DEFAULT_WINDOW_SIZE.height,
    frame: false, // 隐藏顶部导航
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      // webSecurity: false,
      sandbox: false,
    },
    titleBarStyle: "hidden", // mac下的红绿灯
  });

  setMenu();

  if (app.isPackaged) {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;

    win.loadURL(url);
    win.webContents.openDevTools();
  }

  win.on("closed", () => {
    app.exit();
  });

  // Test active push message to Renderer-process
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

async function createMergerMessageWindow() {
  mergerMessageWin = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false, // 无边框
    skipTaskbar: true, // 使窗口不显示在任务栏中
    movable: true, // 禁止窗口被用户移动
    resizable: true, // 禁止窗口手动调整窗口大小
    fullscreenable: true, // 禁止窗口可以进入全屏状态
    alwaysOnTop: true, // 窗口是否永远在别的窗口的上面
    titleBarStyle: "hidden", // mac下的红绿灯
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      sandbox: false,
    },
  });
  if (app.isPackaged) {
    mergerMessageWin.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}#merger-message`;

    mergerMessageWin.loadURL(url);
    // mergerMessageWin.webContents.openDevTools();
  }

  mergerMessageWin.webContents.on("did-finish-load", () => {
    mergerMessageWin?.webContents.send(ROUTE_HASH, "merger-message");
  });

  mergerMessageWin.on("close", (e) => {
    mergerMessageWin?.hide();
    e.preventDefault();
  });
}

async function createVideoPlayWindow() {
  videoPlayWin = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false, // 无边框
    skipTaskbar: true, // 使窗口不显示在任务栏中
    movable: true, // 禁止窗口被用户移动
    resizable: true, // 禁止窗口手动调整窗口大小
    fullscreenable: true, // 禁止窗口可以进入全屏状态
    alwaysOnTop: true, // 窗口是否永远在别的窗口的上面
    titleBarStyle: "hidden", // mac下的红绿灯
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      sandbox: false,
    },
  });
  if (app.isPackaged) {
    videoPlayWin.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}#video-play`;

    videoPlayWin.loadURL(url);
    // videoPlayWin.webContents.openDevTools();
  }

  videoPlayWin.webContents.on("did-finish-load", () => {
    videoPlayWin?.webContents.send(ROUTE_HASH, "video-play");
  });

  videoPlayWin.on("close", (e) => {
    videoPlayWin?.hide();
    e.preventDefault();
  });
}

// scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: "local",
    privileges: {
      stream: true,
    },
  },
]);

app
  .whenReady()
  .then(() => {
    createWindow();
    createMergerMessageWindow();
    createVideoPlayWindow();
    createUpdateWindow();
  })
  .then(() => {
    // if (isDev) {
    globalShortcut.register("CmdOrCtrl+Shift+J", () => {
      BrowserWindow.getAllWindows().map((w: BrowserWindow) =>
        w.webContents.openDevTools()
      );
    });
    // }
  })
  .then(() => {
    registerOpenFileSelectDialog();
    registerImageToBase64();
    registerAudioOrVideoRequest(win);
    registerCheckWindowVisible(win);
    registerFileDownload(win);
    registerScreenshots(win);
    registerWriteFile();
    registerShowMergerMessage(mergerMessageWin);
    registerVideoPlay(videoPlayWin);
    registerPcm2Wav();
    registerShowItemInFolder();
    registerOpenWebsite();
    registerVersionCheck(win);
  })
  .then(() => {
    // 解析本地资源
    protocol.registerFileProtocol("local", (request, callback) => {
      const { url } = request;
      callback(decodeURIComponent(url.slice(9)));
    });
  })
  .catch((err) => {
    log.error(err);
  });

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

ipcMain.on("window-min", () => {
  const focusWin = BrowserWindow.getFocusedWindow();
  const curWin = focusWin || win;
  if (curWin) {
    curWin.minimize();
  }
});
ipcMain.on("window-max", () => {
  const focusWin = BrowserWindow.getFocusedWindow();
  const curWin = focusWin || win;
  if (curWin) {
    curWin.isMaximized() ? curWin.restore() : curWin.maximize();
  }
});
ipcMain.on("window-close", () => {
  const focusWin = BrowserWindow.getFocusedWindow();
  const curWin = focusWin || win;
  if (curWin === win) {
    BrowserWindow.getAllWindows().map((w: BrowserWindow) => w.close());
  } else {
    curWin?.hide();
  }
});
