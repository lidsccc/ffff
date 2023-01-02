import { Menu, dialog, MenuItem } from "electron";
import packageJson from "../../package.json";

export const setMenu = () => {
  // 设置菜单
  const template = [
    new MenuItem({}),
    new MenuItem({
      label: "飞讯",
      submenu: [
        {
          label: "关于",
          click() {
            dialog.showMessageBox({
              title: "关于",
              type: "info",
              message: "飞讯",
              detail: `v${packageJson.version}`,
            });
          },
        },
        {
          label: "编辑",
          submenu: [
            { label: "复制", accelerator: "CmdOrCtrl+C", role: "copy" },
            { label: "粘贴", accelerator: "CmdOrCtrl+V", role: "paste" },
          ],
        },
        {
          label: "退出",
          accelerator: "CmdOrCtrl+Q",
          role: "quit",
        },
      ],
    }),
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
