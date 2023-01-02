<template>
  <el-dialog
    :modelValue="props.visible"
    width="640px"
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div class="container">
      <div
        id="other-video-container"
        :style="{
          backgroundImage: `url(${videoCallUser.avatar})`,
        }"
      ></div>
      <div
        id="self-video-container"
        :style="{
          backgroundImage: `url(${userStore.avatar})`,
        }"
      ></div>
      <img
        class="hang-up-icon"
        src="@/assets/hang_up.png"
        @click="handleHangUp"
      />
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { watch, computed, ref } from "vue";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { VideoCallResult, MessageContentType } from "@/types/message";
import {
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";
import XRTC from "@/../../../xrtc-3.2.2.esm.js";

// XRTC.getDevices().then((deviceList: any) => {
//   console.error("deviceList", deviceList);
// });

const messageStore = useMessageStore();
const userStore = useUserStore();

interface Props {
  visible: boolean;
}
const props = defineProps<Props>();
const emits = defineEmits(["on-visible-change"]);

const isAudioCall = computed(() => {
  return messageStore.audioAndVideoCallRequestMessageContent?.isAudioCall;
});

// const secret = 'D34F84C9963548A9BA4A70AD6D61A99E'; // rtc secret
const clientConfig = {
  wsUrl: "172.30.13.206:30006",
  ssl: false,
  userId: userStore.userId,
  mode: "live",
  sdkAppId: 1000000001,
  userSig:
    "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lIjoiMTYyODA2MTI1MiIsImlzcyI6IjEwMDAwMDAwMDEifQ.q4P13gZ4FNf_96zOmqzfcwozHCbtgpFYRqyR7b68l0g",
};
const roomId = 2206200619;
XRTC.Logger.setLogLevel(XRTC.Logger.LogLevel.ERROR);
const client = XRTC.createClient(clientConfig);

let localStream: any;
watch(
  () => props.visible,
  async () => {
    if (!props.visible) {
      return;
    }
    if (props.visible) {
      client
        .join({ roomId, role: "anchor" })
        .then(async () => {
          // 监听远端流订阅成功事件
          client.on("stream-subscribed", (event: any) => {
            const remoteStream = event.stream;
            // 远端流订阅成功，播放远端音视频流
            remoteStream.play("other-video-container");
          });
          // 监听远端流增加事件
          client.on("stream-added", (event: any) => {
            const remoteStream = event.stream;
            // 订阅远端音频和视频流
            client
              .subscribe(remoteStream, { audio: true, video: true })
              .catch(() => {
                console.error("failed to subscribe remoteStream");
              });
          });
          client.on("stream-removed", async () => {
            await closeStream();
            closeDialog();
          });
        })
        .catch((error: any) => {
          console.error(`Join room failed: ${error}`);
        });
    }
    if (!localStream) {
      // 从麦克风和摄像头采集本地音视频流
      localStream = XRTC.createStream({
        userId: userStore.userId,
        audio: true,
        video: !isAudioCall.value,
      });
      localStream.setVideoProfile({
        width: 600, // 视频宽度
        height: 400, // 视频高度
        frameRate: 15, // 帧率
        bitrate: 1500, // 比特率 kbps
      });
      // live 互动直播模式下，观众切换为主播
      await client.switchRole("anchor");
      // 观众角色切换为主播，开始推流
      await localStream.initialize();
      await client.publish(localStream);
      localStream.play("self-video-container");
    }
  }
);

const isInitiator = computed(() => {
  return (
    messageStore.audioAndVideoCallRequestMessageContent?.replyId ===
    userStore.userId
  );
});
const receiver = computed(() => {
  return isInitiator.value
    ? messageStore.audioAndVideoCallRequestMessageContent?.inviteeIds[0]
    : messageStore.audioAndVideoCallRequestMessageContent?.replyId;
});
const videoCallUser = ref({});
const getViddeoCallUserInfo = async () => {
  if (!receiver.value) return;
  videoCallUser.value = await messageStore.getNameAndAvatar(
    receiver.value as string
  );
};
getViddeoCallUserInfo();
watch(() => receiver.value, getViddeoCallUserInfo);

const audioOrVideoText = computed(() => {
  return isAudioCall.value ? "音频" : "视频";
});
const formatLastingTime = ({ hours, minutes, seconds }: any) => {
  let text = `${audioOrVideoText.value} 通话时长 `;
  if (hours === 0 && minutes === 0) {
    return (text += seconds > 9 ? `00:${seconds}` : `00:0${seconds}`);
  }
  if (hours > 0) {
    text += hours > 9 ? `${hours}:` : `0${hours}:`;
  }
  if (hours > 0 || minutes > 0) {
    text += minutes > 9 ? `${minutes}:` : `0${minutes}:`;
  }
  text += seconds > 9 ? `${seconds}` : `0${seconds}`;
  return text;
};
const sendHangUpMsg = () => {
  // 挂断后发送通话时间
  if (messageStore.audioAndVideoCallStartTime) {
    const now = new Date();
    const hours = differenceInHours(
      now,
      messageStore.audioAndVideoCallStartTime
    );
    const minutes =
      differenceInMinutes(now, messageStore.audioAndVideoCallStartTime) % 60;
    const seconds =
      differenceInSeconds(now, messageStore.audioAndVideoCallStartTime) % 60;
    const customContent = {
      type: VideoCallResult.PRIVATE_HANG_UP,
      lastingTime: formatLastingTime({ hours, minutes, seconds }),
      is_audio_call: false,
    };
    const sendContent = { text: JSON.stringify(customContent) };
    window.$imRender.sendCustomMessage({
      content: sendContent,
      receiver: receiver.value,
      isGroup: null,
      callback: ([code, desc, jsonParams]: any) => {
        console.log([code, desc, jsonParams]);
        if (code !== 0) return;
        try {
          const { mid } = JSON.parse(jsonParams);
          const messageContent = {
            mid,
            content: { data: sendContent.text },
            from: userStore.userId,
            msgType: MessageContentType.Custom,
            to: receiver.value,
            sendTime: Math.floor(Date.now() / 1000),
          };
          messageStore.addPushMessageContent(messageContent);
        } catch (err) {
          console.error(err);
        }
      },
    });
  }
};

const closeStream = async () => {
  if (localStream) {
    await client.unpublish(localStream);
    await client.leave();
    client.off("*");
    await localStream.close();
    localStream = null;
  }
};

const closeDialog = async () => {
  emits("on-visible-change", false);
};

const handleHangUp = async () => {
  sendHangUpMsg();
  await closeStream();
  closeDialog();
};
</script>

<style lang="less" scoped>
.container {
  box-sizing: border-box;
  width: 600px;
  height: 400px;
  position: relative;
  #other-video-container {
    // background: #000;
    position: absolute;
    left: 0;
    right: 0;
    top: -40px;
    bottom: 40px;
    background-size: cover;
  }
  #self-video-container {
    box-sizing: border-box;
    width: 160px;
    height: 160px;
    // background: #000;
    // border: 6px solid #fff;
    position: absolute;
    z-index: 2;
    right: 0;
    top: -40px;
    background-size: cover;
  }
  .hang-up-icon {
    cursor: pointer;
    width: 40px;
    height: 40px;
    position: absolute;
    z-index: 99;
    left: 280px;
    bottom: -15px;
  }
}
</style>
