import { ipcMain } from "electron";
import fs from "fs";
import wav from "wav";
import { PCM2WAV } from "../channel";

export function registerPcm2Wav() {
  ipcMain.handle(PCM2WAV, async (_e, savedPath) => {
    try {
      const out = savedPath.replace(".pcm", "") + ".wav";
      const fileIn = fs.createReadStream(savedPath);
      const fileOut = new wav.FileWriter(out, {
        channels: 1,
        sampleRate: 16000,
      });
      await fileIn.pipe(fileOut);
      return out;
    } catch {
      return "";
    }
  });
}
