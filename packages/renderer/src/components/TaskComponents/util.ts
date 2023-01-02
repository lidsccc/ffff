import { FileType } from "@/enums/fileType";
//获得文件名
export function getFileName(fileName: string) {
  return fileName.substring(0, fileName.lastIndexOf(".")) || "";
}
//获得文件后缀
export function getFileSuffix(fileName: string) {
  return fileName.substring(fileName.lastIndexOf("."), fileName.length) || "";
}
// 根据后缀名匹配文件类型
export function matchType(fileName: string) {
  // 后缀获取
  let suffix = "";
  // 获取类型结果
  let result = "";
  const flieArr = fileName.split(".");
  suffix = flieArr[flieArr.length - 1] || "";
  // fileName无后缀返回 unkown
  if (!suffix) {
    return FileType.UNKOWN;
  }
  suffix = suffix.toLocaleLowerCase();
  // // 图片格式
  // const imglist = ["png", "jpg", "jpeg", "bmp", "gif"];
  // // 进行图片匹配
  // result = imglist.find((item) => item === suffix) || "";
  // if (result) {
  //   return FileType.Image;
  // }
  // 匹配txt
  const txtlist = ["txt"];
  result = txtlist.find((item) => item === suffix) || "";
  if (result) {
    return FileType.TXT;
  }
  // 匹配 excel
  const excelist = ["xls", "xlsx"];
  result = excelist.find((item) => item === suffix) || "";
  if (result) {
    return FileType.EXCEL;
  }
  // 匹配 word
  const wordlist = ["doc", "docx"];
  result = wordlist.find((item) => item === suffix) || "";
  if (result) {
    return FileType.WORD;
  }
  // 匹配 pdf
  const pdflist = ["pdf"];
  result = pdflist.find((item) => item === suffix) || "";
  if (result) {
    return FileType.PDF;
  }
  // 匹配 ppt
  const pptlist = ["ppt", "pptx"];
  result = pptlist.find((item) => item === suffix) || "";
  if (result) {
    return FileType.PPT;
  }

  // 匹配 音频
  const musiclist = ["mp3", "wav", "wmv"];
  result = musiclist.find((item) => item === suffix) || "";
  if (result) {
    return FileType.MUSIC;
  }
  // 其他 文件类型
  return FileType.UNKOWN;
}
