<template>
  <div class="container">
    <div id="remote_stream" class="video-window" @click="playStream"></div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user";
import XRTC from "@/../../../xrtc-3.2.2.esm.js";

const userStore = useUserStore();

// console.log("XRTC", XRTC);

// XRTC.checkSystemRequirements().then((res: any) => {
//   console.log("checkSystemRequirements", res);
// });

// const isScreenShareSupported = XRTC.isScreenShareSupported();
// console.log("isScreenShareSupported", isScreenShareSupported);

// XRTC.getDevices().then((res: any) => {
//   console.log("getDevices", res);
// });

// XRTC.getCameras().then((res: any) => {
//   console.log("getCameras", res);
// });

// secret: D34F84C9963548A9BA4A70AD6D61A99E
const clientConfig = {
  wsUrl: "172.30.13.206:30006",
  ssl: false,
  userId: userStore.userId,
  mode: "live",
  sdkAppId: 1000000001,
  userSig:
    "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lIjoiMTYyODA2MTI1MiIsImlzcyI6IjEwMDAwMDAwMDEifQ.q4P13gZ4FNf_96zOmqzfcwozHCbtgpFYRqyR7b68l0g",
};
const client = XRTC.createClient(clientConfig);

client
  .join({ roomId: 2206200619, role: "anchor" })
  .then(async () => {
    // 监听远端流订阅成功事件
    client.on("stream-subscribed", (event) => {
      const remoteStream = event.stream;
      // 远端流订阅成功，播放远端音视频流
      remoteStream.play("remote_stream");
    });
    // 监听远端流增加事件
    client.on("stream-added", (event) => {
      const remoteStream = event.stream;
      // 订阅远端音频和视频流
      client.subscribe(remoteStream, { audio: true, video: true }).catch(() => {
        console.error("failed to subscribe remoteStream");
      });
      // 仅订阅音频数据
      // client.subscribe(remoteStream, { audio: true, video: false }).catch(e => {
      //  console.error('failed to subscribe remoteStream');
      // });
    });

    // 从麦克风和摄像头采集本地音视频流
    const localStream = XRTC.createStream({
      userId: "feigao12",
      audio: true,
      video: true,
    });
    // 使用自定义视频Profile设置
    localStream.setVideoProfile({
      width: 360, // 视频宽度
      height: 360, // 视频高度
      frameRate: 10, // 帧率
      bitrate: 400000, // 比特率 kbps
    });
    // live 互动直播模式下，观众切换为主播
    await client.switchRole("anchor");
    // 观众角色切换为主播，开始推流
    await localStream.initialize();
    await client.publish(localStream);
  })
  .catch((error: any) => {
    console.error(`Join room failed: ${error}`);
  });

const playStream = () => {};
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-window {
  width: 600px;
  height: 400px;
  background: #fff;
  border: 4px solid #000;
}
</style>
