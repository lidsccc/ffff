// 秒 转换为 时分秒 格式
export const getTime = (num: number) => {
  const hours = Math.floor(num / 3600);
  const minutes = Math.floor((num % 60) / 60);
  const seconds = Math.floor(num % 60);

  if (hours === 0) {
    return `${String(minutes)}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(hours)}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
};

export const formatTime = (timeStr: string) => {
  if (!timeStr) {
    return timeStr;
  }

  try {
    const [date, time] = timeStr.split("T");
    const [year, month, day] = date.split("-");
    const formatDate = `${year}年${month}月${day}日`;
    const hourAndMinute = time.split(":").slice(0, 2).join(":");
    return `${formatDate} ${hourAndMinute}`;
  } catch {
    return "";
  }
};
