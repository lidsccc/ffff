<template>
  <el-dialog
    :modelValue="messageStore.isAudioAndVideoCallRequestVisible"
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="false"
    custom-class="audio-and-video-call-request-dialog"
  >
    <div class="container select-none">
      <!-- <img class="close-icon" src="@/assets/close.png" @click="refuse" /> -->
      <div class="header">
        <!-- <div class="box box-1"></div>
        <div class="box box-2"></div> -->
        <img class="avatar" :src="user.avatar" />
        <div class="name">{{ user.name || "" }}</div>
        <div>
          {{ inviteText }}
        </div>
      </div>
      <WaitLoading />
      <div class="bottom">
        <div class="item" @click="refuse">
          <img class="icon" src="@/assets/hang_up.png" />
          <div class="text">{{ isInitiator ? "取消" : "拒绝" }}</div>
        </div>
        <!-- <div class="dot-container">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div> -->
        <div v-if="!isInitiator" class="item" @click="answer">
          <img class="icon" src="@/assets/answer.png" />
          <div class="text">接听</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useMessageStore } from "@/store/modules/message";
import { useUserStore } from "@/store/modules/user";
import WaitLoading from "@/components/WaitLoading/index.vue";
// import { VideoCallResult } from "@/types/message";
import { get } from "lodash-es";

const messageStore = useMessageStore();
const userStore = useUserStore();

// 音视频发起者
const isInitiator = computed(() => {
  return (
    messageStore.audioAndVideoCallRequestMessageContent?.replyId ===
    userStore.userId
  );
});
const inviteText = computed(() => {
  let audioOrVideoText = messageStore.audioAndVideoCallRequestMessageContent
    ?.isAudioCall
    ? "音频"
    : "视频";
  return isInitiator.value
    ? `正在等待对方接受${audioOrVideoText}邀请`
    : `正在邀请你${audioOrVideoText}通话`;
});
const receiver = computed(() => {
  return isInitiator.value
    ? get(messageStore, "audioAndVideoCallRequestMessageContent.inviteeIds[0]")
    : get(messageStore, "audioAndVideoCallRequestMessageContent.replyId");
});

const user = ref({});
const getUserInfo = async () => {
  if (!receiver.value) return;
  user.value = await messageStore.getNameAndAvatar(receiver.value as string);
};
getUserInfo();
watch(() => receiver.value, getUserInfo);

const refuse = () => {
  messageStore.refuseCall();
};
const answer = () => {
  messageStore.answerCall();
};
</script>

<style lang="less">
.audio-and-video-call-request-dialog {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
<style lang="less" scoped>
.container {
  box-sizing: border-box;
  height: 335px;
  border-radius: 2px;
  background-color: #2b2b2b;

  .close-icon {
    width: 18px;
    height: 18px;
    position: absolute;
    z-index: 99;
    right: 16px;
    top: 16px;
    cursor: pointer;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
    box-sizing: border-box;
    height: 210px;
    background: url(../../assets/audio_bg.png);
    background-size: cover;
    // border: 1px dashed #999;
    margin: 5px;
    position: relative;
    top: 5px;

    .avatar {
      margin-top: 50px;
      width: 78px;
      height: 78px;
      border-radius: 50%;
    }
    .name {
      margin: 16px 0 10px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .box {
      width: 30px;
      height: 30px;
      border: 1px dashed #999;
      position: absolute;
    }
    .box-1 {
      left: 20px;
      top: 20px;
    }
    .box-2 {
      left: 20px;
      bottom: 20px;
    }
  }

  .dot-container {
    position: relative;
    top: 10px;
    display: flex;
    .dot {
      margin: 0 4px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #31c0c7;
    }
  }

  .bottom {
    height: 125px;
    display: flex;
    justify-content: center;
    .item {
      margin: 0 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      .icon {
        width: 30px;
        height: 30px;
      }
      .text {
        margin-top: 10px;
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>
