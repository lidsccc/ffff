import log from "electron-log";
import path from "path";

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();

const logFileName = `feixun-desktop-log-${year}-${month}-${day}.log`;

log.transports.console.level =
  process.env.NODE_ENV === "development" ? "silly" : false;
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

// on Linux: ~/.config/{app name}/logs/{process type}.log
// on macOS: ~/Library/Logs/{app name}/{process type}.log
// on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
log.transports.file.resolvePath = (variables) => {
  return path.join(variables.libraryDefaultDir, logFileName);
};

export default log;
