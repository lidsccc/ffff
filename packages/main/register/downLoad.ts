const { ipcMain, dialog, shell } = require("electron");
const path = require("path");
import { FILE_DOWNLOAD } from "../channel";
export function registerFileDownload(win: any) {
  let downloadObj = {
    downloadPath: "", // 要下载的链接或文件
    fileName: "", // 要保存的文件名，需要带文件后缀名
    savedPath: "", // 要保存的路径
  };
  function resetDownloadObj() {
    downloadObj = {
      downloadPath: "",
      fileName: "",
      savedPath: "",
    };
  }
  // 监听渲染进程发出的download事件
  ipcMain.on(FILE_DOWNLOAD, (evt, args) => {
    downloadObj.downloadPath = args.downloadPath; // 文件url

    downloadObj.fileName = args.fileName; // 文件名
    const ext = path.extname(downloadObj.fileName);
    const filters = [{ name: "", extensions: ["*"] }];
    if (ext && ext !== ".") {
      filters.unshift({
        name: "",
        extensions: [ext.match(/[a-zA-Z0-9]+$/)[0]], // 文件保存类型
      });
    }
    // 弹出另存为弹框，用于获取保存路径
    dialog
      .showSaveDialog(win, {
        filters,
        defaultPath: downloadObj.fileName,
      })
      .then((result) => {
        downloadObj.savedPath = result.filePath; // 选中后获得保存路径
        if (downloadObj.savedPath) {
          win.webContents.downloadURL(downloadObj.downloadPath); // 触发will-download事件
        }
      })
      .catch(() => {});
  });

  win.webContents.session.on("will-download", (event: any, item: any) => {
    //设置文件存放位置
    item.setSavePath(downloadObj.savedPath);
    item.once("done", (event: any, state: string) => {
      if (state === "completed") {
        console.log("Download successfully");
        shell.showItemInFolder(downloadObj.savedPath); // 下载成功后打开文件所在文件夹
      } else {
        console.log(`Download failed: ${state}`);
      }
      resetDownloadObj();
    });
  });
}
