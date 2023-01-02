import { ElMessage } from "element-plus";
import { IButtonMenu } from "@wangeditor/editor";
import { MessageContentType } from "@/types/message";
import {
  OPEN_FILE_SELECT_DIALOG,
  SCREENSHOTS,
  SEND_SCREENSHOT_IMG,
  WRITE_FILE,
} from "@/../../main/channel";
import { getVideoPreviewInfo } from "@/utils/videoHelper";

export class ScreenshotsMenu implements IButtonMenu {
  // TS 语法
  constructor({ emits }: any) {
    this.title = "截图"; // 自定义菜单标题
    this.iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="36" height="36" viewBox="0 0 36 36"><image id="图层_1" data-name="图层 1" width="36" height="36" xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAB/ElEQVRYhe3Xv2tTURQH8O/3pmlLjFKpruncxaFugqAgTro49Y8Qh5KpJDfvBwQcBP8CwX/ATaSLg4tjhQ4WuqiUTsXNPGuTe8p9+jRJX8hrcu/r4lnej3t45wPvXLgHedGOoqedIHqRu+g5mPd5HYQnAixWFqvrwfb2vk9CO4puK4NN1mvPg2bzWI0niAgtxt6rfr/qE9OJ43s08sFAmtLrPUpr+iw4DSMD81aAGshdrKy8QfbLdBg+BtSNLFnEvEoXqTSAQw+eaxDTzTDqav1BuLX1Pa3ZieOHZmB2PBSdHmMYGwtcXv7EXrIDkZvZSwE20hvyM0USV/WFXIPIavasKurZMAaTdlk7CMVeq4q3tNZ7LjAjPfNXxDux1h+H83J3mQvARAy5S+DXpNxzIJLiE2N7BkC/MMg3ZrxnSgPNgvEGmhXjBTQPxjloXoxTkAuMM5ArjBOQS8zcINeYuUA+MDODfGFmAvnEXBjkG3MhUBmYwqCyMIVAZWKmgk6B+2VickEjR1jByzIxyDvkW5AOI/MvgwmIZgVwhjFGXtvp2M59inKQvhM5YaPxbtJsP5BLmGpJxAu5C2AXkCe+Cgu5DhES+CL2D/yOn1R873zkKRI6CH+kvVlkLrvs+A/6E99Ani4pdTS+kNvUvkPVr9ytJMn1Vqv1daQWgDNM9VSKg0dq1AAAAABJRU5ErkJggg=="/></svg>`; // 可选
    this.tag = "button";
    this.emits = emits;
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(): string | boolean {
    return false;
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(): boolean {
    return false;
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(): boolean {
    return false;
  }

  // 点击菜单时触发的函数
  exec() {
    window.ipcRenderer.send(SCREENSHOTS);
    window.ipcRenderer.once(
      SEND_SCREENSHOT_IMG,
      (_event, { screenshotsPath }) => {
        console.log("发送截图", screenshotsPath);
        this.emits("on-send-message", {
          type: MessageContentType.Image,
          params: {
            imagePath: screenshotsPath,
            thumbnailPath: screenshotsPath, // TODO:缩略图路径
          },
        });
      }
    );
  }
}

export class FileMenu implements IButtonMenu {
  // TS 语法
  constructor({ emits }: any) {
    this.title = "文件"; // 自定义菜单标题
    this.iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="38" height="38" viewBox="0 0 38 38"><image id="图层_1" data-name="图层 1" x="2" y="5" width="34" height="28" xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAcCAYAAAAEN20fAAABxUlEQVRIie2XwUobURiFz39zlVaiUpAu7KrQhVAqdedCKKUvYPsEXboTBWmEZJK5FQ1FfQKhLyDYR2gXbopg8RmqC0FBjAl1MveUa5JGB9JmxsG6mG9Ww/Cf+83M5vyClDHGPA9FnvaRWns4MLBfKBTO3E2qIiVjCiBWQfaVK0BdlMz7nreVmojnf1wm7WrsQZFQ5dS0TltCgB+DOjerlKr9babZbI4HxDeQjxiGs1ci5bW1Z/ZXsCHgDIB8XBHSDnYkZGT4TXFx8bSPsRPPNwcEXpHyRFfW18ds7WIXwGPGNbhGR8LvT+LmrFB0WK+/dxLuXwm4QpGjRCL5/HYSiQ5ayAm23ui7KZcrSYNui3Iy7YzL/yWBtsi9IBOJkolEyUSiZCJRMpEoPYuR5/uvQWxSZDiNg4Q8l5xa8Eulr7FEALwl8BK8TUvpcpVi7TsA8UTU0NBK2Gj8VBapfBGrcP5A68+9nvcUqSwtHQP4lIbEvyCFWiiHhLswaYx5obVO1NDi0i7Pk2hVxUMNrXYQ2g+uTQfEQXAZ3IVHF1dRc+qL8ovFPSWYc8vO3Rq0Fix3tnP4s2BVq9XRRhBMJVknEtJdOQH8Bi5KpWRLCQ84AAAAAElFTkSuQmCC"/></svg>`; // 可选
    this.tag = "button";
    this.emits = emits;
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  getValue(): string | boolean {
    return false;
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(): boolean {
    return false;
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(): boolean {
    return false;
  }

  // 点击菜单时触发的函数
  async exec() {
    const {
      filePath,
      fileName,
      size = 0,
    } = await window.ipcRenderer.invoke(OPEN_FILE_SELECT_DIALOG);
    console.log("handleSendFile", { filePath, fileName, size });
    if (!filePath) return;
    if (size > 500 * 1000 * 1000) {
      ElMessage.warning({ message: "选择文件大小不能超过500M" });
      return;
    }
    if (
      filePath.endsWith(".jpg") ||
      filePath.endsWith(".png") ||
      filePath.endsWith(".jpeg") ||
      filePath.endsWith(".gif") ||
      filePath.endsWith(".bmp") ||
      filePath.endsWith(".webp")
    ) {
      // 发送图片
      this.emits("on-send-message", {
        type: MessageContentType.Image,
        params: {
          imagePath: filePath,
          thumbnailPath: filePath, // TODO:缩略图路径
        },
      });
      return;
    }
    if (
      filePath.endsWith(".mp4") ||
      filePath.endsWith(".flv") ||
      filePath.endsWith(".avi") ||
      filePath.endsWith(".mov")
    ) {
      // 发送视频
      const { duration, url } = await getVideoPreviewInfo(
        `local:///${filePath}`
      );
      console.log("视频时长", duration);
      const snapShotPath = await window.ipcRenderer.invoke(WRITE_FILE, url);
      console.log("视频第一帧截图保存路径", snapShotPath);
      this.emits("on-send-message", {
        type: MessageContentType.Video,
        params: {
          videoPath: filePath,
          snapShotPath,
          duration,
        },
      });
      return;
    }
    if (
      filePath.endsWith(".mp3") ||
      filePath.endsWith(".wav") ||
      filePath.endsWith(".pcm")
    ) {
      // 发送音频
      const { duration } = await getVideoPreviewInfo(`local:///${filePath}`);
      console.log("音频时长", duration);
      this.emits("on-send-message", {
        type: MessageContentType.Audio,
        params: {
          audioPath: filePath,
          duration,
        },
      });
      return;
    }
    // 发送文件
    this.emits("on-send-message", {
      type: MessageContentType.File,
      params: {
        filePath,
        fileName,
        size,
      },
    });
  }
}
