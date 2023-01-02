import { get } from "lodash-es";

// 获得缓存中的头像
export const getCacheAvator = (avatar?: string) =>
  avatar ? get(window.__GLOBAL_AVATAR_CACHE__, avatar, avatar) : avatar;
