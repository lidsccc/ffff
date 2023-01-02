function loadVideo(path: string) {
  return new Promise((resolve, reject) => {
    const videoEle = document.createElement("video");

    videoEle.onloadeddata = () => resolve(videoEle);
    videoEle.onerror = () => reject("video数据加载失败");

    videoEle.setAttribute("preload", "auto");
    videoEle.src = path;
  });
}

export async function getVideoPreviewInfo(path: string) {
  const video: any = await loadVideo(path);
  const canvasElem = document.createElement("canvas");
  const { videoWidth, videoHeight } = video;
  canvasElem.width = videoWidth;
  canvasElem.height = videoHeight;
  canvasElem.getContext("2d")!.drawImage(video, 0, 0, videoWidth, videoHeight);
  const url = canvasElem.toDataURL();

  return {
    duration: ((video as any)?.duration || 0) * 1000, // 毫秒
    url,
  };
}
