# electron-vue-vite

![awesome-vite](https://camo.githubusercontent.com/abb97269de2982c379cbc128bba93ba724d8822bfbe082737772bd4feb59cb54/68747470733a2f2f63646e2e7261776769742e636f6d2f73696e647265736f726875732f617765736f6d652f643733303566333864323966656437386661383536353265336136336531353464643865383832392f6d656469612f62616467652e737667)
![GitHub license](https://img.shields.io/github/license/caoxiemeihao/electron-vue-vite?style=flat)
![GitHub stars](https://img.shields.io/github/stars/caoxiemeihao/electron-vue-vite?color=fa6470&style=flat)
![GitHub forks](https://img.shields.io/github/forks/caoxiemeihao/electron-vue-vite?style=flat)


**[English](README.md) | ç®ä½ä¸­æ**

ð¥³ `Electron` + `Vue3` + `Vite2` æ´åæ¨¡æ¿ -- **ç»æç®åï¼å®¹æä¸æï¼**

## æ¦è¿°

&emsp;&emsp;è¿æ¯ä¸ä¸ªè¿½æ±ç²¾ç®ç`Electron`ç±»æ´åæ¨¡æ¿ï¼åªä¿ææåºæ¬çæä»¶ãæåºæ¬çä¾èµãæåºæ¬çåè½ï¼èä¸æ¯å¤§èå¨çãèè¿çè®¾è®¡ãè¿æ ·åçç®çæ¯è½ç¡®ä¿æ¨¡æ¿è¶³å¤çµæ´»ã

æä»¥è¯´å¦æä½ æ¯å¯¹ -- å·¥ç¨æ¨¡æ¿è¿½æ±ç²¾ç®ç Coderï¼æèåå¥ä¸çå°ç½æ³å¼æç½`Electron`æ´åç±»æ¨¡æ¿æåºç¡çå·¥ä½åçï¼äº¦æèä½ æ¯å¤§ç¥åªæ¯æ³å·æå°å¹²ç¹æ´»ï¼é£ä¹è¿ä¸ªæ¨¡æ¿æåéä½ ä¸è¿äºã

å°½ç®¡å¦æ­¤ï¼æè¿æ¯å¸æä½ å¯¹`Electron` `Vite`æä¸å®çåºç¡ï¼å ä¸ºé¤äºé¡¹ç®ç»æç®åå¤ï¼è¿ä»½`README`ä¹æ¾å¾ âç²¾ç®â ã

æ¨¡æ¿çå·ä½å®ç°ç»èæç¸ä¿¡ä½ çä¸¤éæºç å°±è½æå®åéäº ð

## è¿è¡é¡¹ç®

  ```bash
  # clone the project
  git clone https://github.com/caoxiemeihao/electron-vue-vite.git

  # enter the project directory
  cd electron-vue-vite

  # install dependency
  npm install

  # develop
  npm run dev
  ```

## ç®å½ç»æ

&emsp;&emsp;ä¸æ¦å¯å¨ææåèæ¬æ§è¡è¿ï¼ä¼å¨æ ¹ç®å½äº§ç **`dist` æä»¶å¤¹ï¼éé¢çæä»¶å¤¹å `packages` ä¸æ¨¡ä¸æ ·**ï¼å¨ä½¿ç¨ä¸äºè·¯å¾è®¡ç®æ¶ï¼å°¤å¶æ¯ç¸å¯¹è·¯å¾è®¡ç®ï¼`dist` ä¸ `packages` éé¢ä¿æç¸åçç®å½ç»æè½é¿å¼å¥½å¤é®é¢

```tree
â
âââ dist                      æå»ºåï¼æ ¹æ® packages ç®å½çæ
â   âââ main
â   âââ preload
â   âââ renderer
â
âââ scripts
â   âââ build.mjs             é¡¹ç®å¼åèæ¬ npm run build
â   âââ watch.mjs             é¡¹ç®å¼åèæ¬ npm run dev
â
âââ packages
â   âââ main                  ä¸»è¿ç¨æºç 
â       âââ vite.config.ts
â   âââ preload               é¢å è½½èæ¬æºç 
â       âââ vite.config.ts
â   âââ renderer              æ¸²æè¿ç¨æºç 
â       âââ vite.config.ts
â
```

## ä¾èµæ¾å° dependencies è¿æ¯ devDependencies

&emsp;&emsp;å¯¹å¾ **Electron-MainãPreload-Script** æ¶ vite ä¼ä»¥ lib å½¢å¼æå commonjs æ ¼å¼ä»£ç ï¼
å¦æç¢° node ç¯å¢çåå¯ä»¥ç´æ¥æ¾å° dependencies ä¸­ï¼vite ä¼è§£æä¸º require('xxxx')ï¼
electron-builder æåæ¶åä¼å° dependencies ä¸­çåæåå° app.asar éé¢

&emsp;&emsp;å¯¹å¾ **Electron-Renderer** æ¶ vite ä¼ä»¥ ESM æ ¼å¼è§£æä»£ç ï¼
å vueãreact è¿ç§åç«¯ç¨çåå¯ä»¥ç´æ¥è¢« vite æå»ºï¼æä»¥ä¸éè¦ vueãreact æºç ï¼
ç°å®æåµ vueãreact æ¾å° dependencies æ devDependencies ä¸­é½å¯ä»¥è¢«æ­£ç¡®æå»ºï¼
ä½æ¯æ¾å° dependencies ä¼è¢« electron-builder æåå° app.asar éé¢å¯¼è´åä½åå¤§ï¼
æä»¥æ¾å° devDependencies æ¢è½è¢«æ­£ç¡®æå»ºè¿å¯ä»¥åå° app.asar ä½ç§¯ï¼ä¸ä¸¾ä¸¤å¾

## æ¸²æè¿ç¨ä½¿ç¨ NodeJs API

> ð§ å ä¸ºå®å¨çåå  Electron é»è®¤ä¸æ¯æå¨ æ¸²æè¿ç¨ ä¸­ä½¿ç¨ NodeJs APIï¼ä½æ¯æäºå°æ²éå°±æ¯æ³è¿ä¹å¹²ï¼æ¦é½æ¦ä¸ä½ï¼å®å¨æ³é£ä¹å¹²çè¯ï¼ç¨å¦ä¸ä¸ªæ¨¡æ¿æ´æ¹ä¾¿ ð **[electron-vite-boilerplate](https://github.com/caoxiemeihao/electron-vite-boilerplate)**

**æ¨èææç NodeJsãElectron API éè¿ `Preload-script` æ³¨å¥å° æ¸²æè¿ç¨ä¸­ï¼ä¾å¦ï¼**

* **packages/preload/index.ts**

  ```typescript
  import fs from 'fs'
  import { contextBridge, ipcRenderer } from 'electron'

  // --------- Expose some API to Renderer-process. ---------
  contextBridge.exposeInMainWorld('fs', fs)
  contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
  ```

* **packages/renderer/src/global.d.ts**

  ```typescript
  // Defined on the window
  interface Window {
    fs: typeof import('fs')
    ipcRenderer: import('electron').IpcRenderer
  }
  ```

* **packages/renderer/src/main.ts**

  ```typescript
  // Use Electron, NodeJs API in Renderer-process
  console.log('fs', window.fs)
  console.log('ipcRenderer', window.ipcRenderer)
  ```

  ```typescript
  // Use Electron, NodeJs API in Renderer-process
  console.log('fs', window.fs)
  console.log('ipcRenderer', window.ipcRenderer)
  ```

**å¦æä½ ççå¨è¿ä¸ªæ¨¡æ¿ä¸­å¼å¯äº `nodeIntegration: true` `contextIsolation: false` æä¸æ¦ç  
ð§ ä½æ¯è¦æéä½ åä¸¤ä»¶äºå¿**

1. `preload/index.ts` ä¸­ç `exposeInMainWorld` å æï¼å·²ç»æ²¡æç¨äº

  ```diff
  - contextBridge.exposeInMainWorld('fs', fs)
  - contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
  ```

2. `configs/vite-renderer.config` ä¸­æä¸ª `resolveElectron` **æå¥½äºè§£ä¸**  
ð è¿éæä¸ª `issues` [è¯·æä¸ä¸vite-renderer.configä¸­çresolveElectronå½æ°](https://github.com/caoxiemeihao/electron-vue-vite/issues/52)
