export function dataURLtoBlob(dataUrl: string) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime,
  });
}

export const isImg = (type: string) => {
  return ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(type);
};

export const isVideo = (type: string) => {
  return ["mp4", "flv", "avi", "mov"].includes(type);
};

export const isAudio = (type: string) => {
  return ["mp3", "wav", "pcm"].includes(type);
};
