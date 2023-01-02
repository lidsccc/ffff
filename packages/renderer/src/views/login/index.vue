<template>
  <div v-if="isWindows" class="window-size-wapper">
    <WindowSize />
  </div>
  <div class="h-full px-24 flex justify-center items-center login-page">
    <img src="@/assets/login-bg.png" class="login-bg mr-24" />
    <div
      class="login-container bg-white bg-opacity-80 rounded-lg flex justify-center items-center pr-8 pt-4 shadow-lg"
    >
      <div class="form-wrapper flex flex-col items-center">
        <img src="@/assets/logo.png" class="h-8 mb-10" />
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          show-message
          label-width="80px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              clearable
              @clear="handleClear"
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              @keyup.enter="onSubmit(formRef)"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loginButtonLoading"
              @click="onSubmit(formRef)"
              :style="{ width: '220px' }"
              >登录</el-button
            >
          </el-form-item>
        </el-form>
        <div class="w-full pl-[80px]">
          <el-checkbox
            v-model="rememberPassword"
            label="记住密码"
            size="small"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export const handleReplayAudioOrVideoRequest = (event, result) => {
  if (result) {
    messageStore.answerCall();
  } else {
    messageStore.refuseCall();
  }
};
</script>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { getImToken } from "@/api/message";
import { login, logout } from "@/api/login";
import { basicUser, detailUser } from "@/api/user";
import type { Account } from "@/api/login";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { useGlobalStore } from "@/store/modules/global";
import { useStructureStore } from "@/store/modules/contacts";
import { ElMessage } from "element-plus";
import {
  // MessageActionType,
  // MessageSendStatus,
  MessageContentType,
} from "@/types/message";
import {
  isVideoCallRequestMessage,
  getCustomMessageContent,
  isVideoCallReject,
  isVideoCallAccept,
  isPinMessage,
} from "@/utils/message";
import {
  AUDIO_OR_VIDEO_REQUEST,
  CHECK_WINDOW_VISIBLE,
  REPLY_AUDIO_OR_VIDEO_REQUEST,
  CLOSE_AUDIO_OR_VIDEO_SMALL_DIALOG,
} from "@/../../main/channel";
import { cacheAvatar } from "./task/cahceData";
import CryptoJS from "crypto-js";

import WindowSize from "@/layout/WindowSize.vue";

const isWindows = computed(() => window["$platform"] === "win32");

const userStore = useUserStore();
const messageStore = useMessageStore();
const globalStore = useGlobalStore();
const structureStore = useStructureStore();
type FormInstance = InstanceType<typeof ElForm>;

const formRef = ref<FormInstance>();
const rememberPassword = ref(localStorage.getItem("rememberPassword") === "1");
const username = localStorage.getItem("userId") || "";
const password = CryptoJS.AES.decrypt(
  localStorage.getItem("password") || "",
  username
).toString(CryptoJS.enc.Utf8);
const form = reactive<Account>({
  username,
  password,
});
const loginButtonLoading = ref(false);
const handleClear = () => {
  form.username = "";
  form.password = "";
};

const rules = reactive({
  username: [
    {
      required: true,
      message: "请输入用户名",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
});
const MAX_LOGIN_RETRIES = 3; // 登录失败再大重试次数
let loginRetries = MAX_LOGIN_RETRIES;
let resetLoginRetriesTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  if (!globalStore.hasInitSDK) {
    globalStore.hasInitSDK = true;
    // 初始化im sdk
    window.$imRender.initSDK().then((data: any) => {
      console.log("im initSDK: ", data);
    });
  }
});
onUnmounted(() => {
  if (resetLoginRetriesTimer) {
    resetLoginRetriesTimer = null;
  }
});

const router = useRouter();
const onSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl || loginButtonLoading.value) return;
  formEl.validate(async (valid) => {
    if (!valid) return;

    loginButtonLoading.value = true;

    if (loginRetries <= 0) {
      ElMessage.warning({ message: "登录失败次数太多，请稍后再试" });
      loginButtonLoading.value = false;
      return;
    }

    // 登录
    const loginRes = await login({ ...form }).catch(() => {
      loginRetries -= 1;
      if (!resetLoginRetriesTimer) {
        resetLoginRetriesTimer = setTimeout(() => {
          loginRetries = MAX_LOGIN_RETRIES;
          resetLoginRetriesTimer = null;
        }, 30 * 1000);
      }
      loginButtonLoading.value = false;
    });
    if (!loginRes) {
      loginButtonLoading.value = false;
      return;
    }
    userStore.setUser(loginRes);

    // 用户基本信息
    const userRes = await basicUser().catch(() => {
      loginButtonLoading.value = false;
    });
    userStore.setUser({ ...loginRes, ...userRes }); // 持久化token到localStorage 是一个异步

    localStorage.setItem(
      "rememberPassword",
      rememberPassword.value ? "1" : "0"
    );
    // 记住用户名
    localStorage.setItem("userId", form.username);
    // 记住密码
    localStorage.setItem(
      "password",
      CryptoJS.AES.encrypt(
        rememberPassword.value ? form.password : "",
        form.username
      ).toString()
    );

    // 异步缓存用户头像
    cacheAvatar(userRes);

    window.ipcRenderer.on(
      REPLY_AUDIO_OR_VIDEO_REQUEST,
      handleReplayAudioOrVideoRequest
    );

    const imToken = await getImToken().catch(() => {
      loginButtonLoading.value = false;
    });

    /**
     * IM SDK相关
     */
    // im sdk登录
    window.$imRender
      .login({
        userID: userRes.userId,
        token: imToken,
      })
      .then(({ data }: any) => {
        console.log("im login: ", data);
        if (data.code !== 0) {
          window.$log.error("登录失败", imToken);
        }
      })
      .finally(() => {
        // 拉取会话层
        messageStore.fetchConversationList();
      });

    // 账号挤下线回调
    window.$imRender.addIMSDKListener({
      callback: ([code, desc, jsonParams]: any) => {
        switch (code) {
          case 23001:
            // 被挤下线了
            ElMessage.error({ message: "您的账号已在其他设备登录" });
            logout({ userId: userStore.userId }).then(() => {
              window.ipcRenderer.removeListener(
                REPLY_AUDIO_OR_VIDEO_REQUEST,
                handleReplayAudioOrVideoRequest
              );

              window.$imRender.removeIMConversationListener();
              window.$imRender.detachMsgListener();
              window.$imRender.logout();

              messageStore.$reset();

              router.replace({ path: "/" });
            });
            break;
          case 12002:
            console.log("连接断开");
            globalStore.setIsImSDKOffline(true);
            break;
          case 2:
            console.log("正在连接中...");
            break;
          case 0:
            console.log("连接成功");
            globalStore.setIsImSDKOffline(false);
            break;
          default:
            // 未知情况
            window.$log.error({ code, desc, jsonParams });
        }
      },
    });

    // 会话层监听回调
    window.$imRender.addIMConversationListener({
      callback: async ([code, desc, jsonParams]: any) => {
        // 会话层变动
        if (code === 2) {
          // 新增会话层
          try {
            const [conversation] = JSON.parse(jsonParams);
            messageStore.addConversation(conversation);
          } catch (err: any) {
            window.$log.error("新增会话层解析失败", [code, desc, jsonParams]);
          }
        }
        if (code === 0) {
          // 更新会话层
          try {
            const [conversation] = JSON.parse(jsonParams);
            messageStore.updateConversation(conversation);
          } catch (err: any) {
            window.$log.error("新增会话层解析失败", [code, desc, jsonParams]);
          }
        }
      },
    });

    // 消息监听回调
    window.$imRender.attachMsgListener({
      callback: async (jsonMsgArray: string) => {
        let list = [];
        try {
          list = JSON.parse(jsonMsgArray) || [];
        } catch (err: any) {
          window.$log.error("attachMsgListener error: ", err);
        }
        if (list.length !== 1) {
          // TODO:返回的消息多余一条
          window.$log.error("收到的消息超过一条: ", list);
          return;
        }
        const message = list[0];
        // message.hasRead =
        //   message.from === messageStore.activeRecordId ? 1 : 0; // 当前激活的会话层收到消息都默认已读

        // ROBOT_PIN 通知消息 更新未回执Pin数量
        if (isPinMessage(message)) {
          globalStore.updatePinBadge();
          return;
        }

        // 超时1分钟的通知消息丢弃
        if (
          message.notify &&
          Date.now() - message.sendTime * 1000 > 60 * 1000
        ) {
          return;
        }

        // 判断是不是音视频邀请的通知消息
        if (isVideoCallRequestMessage(message)) {
          if (
            messageStore.isAudioAndVideoCallRequestVisible ||
            messageStore.isAudioAndVideoCallDialogVisible ||
            messageStore.isAudioAndVideoCallSmallDialogVisible
          ) {
            // 正在通话中或拨打中 忽略其他邀请
            return;
          }
          const requestMessage = getCustomMessageContent(message);
          messageStore.setAudioAndVideoCallRequestMessageContent(
            requestMessage
          );
          // 判断窗口是否最小化来决定展示邀请弹窗
          const isWinVisible = await window.ipcRenderer.invoke(
            CHECK_WINDOW_VISIBLE
          );
          if (isWinVisible) {
            messageStore.setIsAudioAndVideoCallRequestVisible(true);
          } else {
            const { name: replyName, avatar: replyAvatar } =
              await messageStore.getNameAndAvatar(requestMessage.replyId);
            window.ipcRenderer.invoke(AUDIO_OR_VIDEO_REQUEST, {
              ...requestMessage,
              replyName,
              replyAvatar,
            });
            messageStore.setIsAudioAndVideoCallSmallDialogVisible(true);
          }
          return;
        }

        if (isVideoCallReject(message)) {
          messageStore.clearAudioAndVideoCallRequestTimer();
          messageStore.setIsAudioAndVideoCallRequestVisible(false);
          messageStore.setAudioAndVideoCallDialogVisible(false);
          messageStore.setIsAudioAndVideoCallSmallDialogVisible(false);
          window.ipcRenderer.invoke(CLOSE_AUDIO_OR_VIDEO_SMALL_DIALOG); // 别人取消音视频邀请, 如果自己是小弹窗展示，也要关闭掉
          return;
        }
        if (isVideoCallAccept(message)) {
          messageStore.clearAudioAndVideoCallRequestTimer();
          messageStore.setIsAudioAndVideoCallRequestVisible(false);
          messageStore.setAudioAndVideoCallDialogVisible(true);
          messageStore.setIsAudioAndVideoCallSmallDialogVisible(false);
          messageStore.setAudioAndVideoCallStartTime(new Date()); // 记录音视频开始时间
          return;
        }

        let messageContent: any = {};
        if (message.content) {
          try {
            messageContent = JSON.parse(message.content);
          } catch (err: any) {
            console.log("收到消息content解析失败", message);
          }
        }

        // 收到图片消息，先下载缩略图用于展示图片消息
        if (message.msgType === MessageContentType.Image) {
          let isOriginalFile = false;
          if (!messageContent.thumbFid) {
            window.$log.error("图片消息没有缩略图", message);
            isOriginalFile = true;
          }
          window.$imRender.downloadFile({
            messageId: message.mid,
            isOriginalFile,
            callback: ([code, desc, jsonParams]: any) => {
              if (code === 0) {
                // 下载成功
                try {
                  const { savedPath } = JSON.parse(jsonParams);
                  message.content = JSON.stringify({
                    ...messageContent,
                    thumbPath: savedPath,
                  });
                } catch (err: any) {
                  window.$log.error("下载图片成功结果解析失败", err);
                  return;
                }
                // message.hasRead =
                //   message.from === messageStore.activeRecordId
                //     ? 1
                //     : 0;
                messageStore.addReceiveMessageContent(message);
              } else if (code === 1) {
                // 下载进度不做处理
              } else {
                // 下载失败
                ElMessage.error(`下载缩略图失败：${desc}`);
              }
            },
          });
          return;
        }

        messageStore.addReceiveMessageContent(message);
      },
    });

    // 消息对方已读通知
    window.$imRender.setM2MReadReceiptCallBack({
      callback: (list: any) => {
        try {
          const message = JSON.parse(list[0]);
          messageStore.setMessageOtherSideRead(message);
        } catch (err) {
          window.$log.error("已读回调解析异常", err);
        }
      },
    });

    // 消息撤回回调
    window.$imRender.setMessageRevokeCallBack({
      callback: (res: any) => {
        const { mid } = JSON.parse(res[0]);
        messageStore.setMessageRevoke({ mid });
      },
    });

    // 查询组织架构信息
    structureStore.fetchStructureData();

    // 查询用户详情信息
    const userDetail = await detailUser({ id: userRes.userId }).catch(() => {
      loginButtonLoading.value = false;
    });

    userStore.setDetail(userDetail);
    loginButtonLoading.value = false;
    router.replace({ path: "/messages" });
    // 查询用户操作权限
    globalStore.fetchOperateAuthority();
  });
};
</script>

<style lang="less" scoped>
.window-size-wapper {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10000;
}
.header {
  height: 52px;
  position: absolute;
  left: 0;
  right: 0;
}
.login-page {
  background: #f1f2f3;
  // background: url("@/assets/bg-img.jpeg") no-repeat;
  // background-size: 100% 100%;
  .form-wrapper {
    width: 300px;
  }

  .login-bg {
    width: 360px;
  }

  .login-container {
    width: 400px;
    height: 300px;
  }
}
</style>
