import { filterXSS } from "xss";

/**
 * 转换一段文字中的 url 为 a 标签
 * @param {String} str 要转换的字符串
 * @returns {String} linkStr 转换后的字符串
 */
export const urlToLink = (str: string) => {
  if (!str) {
    return str;
  }

  // 防止 XSS攻击
  const xssStr = filterXSS(str);

  const re1 =
    /(f|ht){1}(tp|tps):\/\/([\w-]+\S)+[\w-]+([\w-?%#&=]*)?(\/[\w- ./?%#&=]*)?/g;
  const re2 =
    /[a-zA-Z][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?([\w-?%#&=]*)?(\/[\w- ./?%#&=]*)?/g;

  if (re1.test(xssStr)) {
    return xssStr.replace(re1, function (url: string) {
      return `<a href=${url} style="color:#00b0bb;text-decoration:underline " target="_blank">${url}</a>`;
    });
  }

  // href必须是https才能跳转默认浏览器
  return xssStr.replace(re2, function (url: string) {
    return `<a href=${`https://${url}`} style="color:#00b0bb;text-decoration:underline " target="_blank">${url}</a>`;
  });
};
