import { IMAGE_TO_BASE64 } from "@/../../main/channel";
import { listDepartmentMemberZip } from "@/api/cache";

export const cacheAvatar = async ({ userId, avatar, realName }: any) => {
  // 缓存全局头像
  const GLOBAL_AVATAR_KEY = "__GLOBAL_AVATAR_CACHE__";
  try {
    window.__GLOBAL_AVATAR_CACHE__ = JSON.parse(
      localStorage.getItem(GLOBAL_AVATAR_KEY) as string
    );
  } catch (err: any) {
    window.$log.error("解析头像缓存数据失败", err);
  }

  if (!window.__GLOBAL_AVATAR_CACHE__) {
    window.__GLOBAL_AVATAR_CACHE__ = {};
  }

  // 获取全量用户头像
  const { items } = await listDepartmentMemberZip({
    pageNum: 1,
    pageSize: 100000,
    userId,
  });

  // 包含自己头像的缓存
  items.push({ iconUrl: avatar, id: userId, name: realName });

  for (let i = 0; i < items.length; i++) {
    const { iconUrl } = items[i];
    if (iconUrl) {
      const base64 = await window.ipcRenderer.invoke(IMAGE_TO_BASE64, iconUrl);
      window.__GLOBAL_AVATAR_CACHE__[
        iconUrl
      ] = `data:image/png;base64,${base64}`;
    }
  }

  localStorage.setItem(
    GLOBAL_AVATAR_KEY,
    JSON.stringify(window.__GLOBAL_AVATAR_CACHE__)
  );
};
