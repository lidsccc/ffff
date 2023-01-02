<template>
  <img
    src="@/assets/setting.png"
    @click="dialogVisible = true"
    class="menu-icon select-none"
  />
  <el-dialog v-model="dialogVisible" title="设置" :width="CreateDialogWidth">
    <el-tabs tab-position="left" style="height: 320px" class="demo-tabs">
      <el-tab-pane label="帐号设置">
        <div class="flex flex-col items-center">
          <UserAvatar
            :size="64"
            :src="getCacheAvator(userStore.avatar)"
            :name="userStore.firstName"
            :id="userStore.userId"
          >
            <span class="text-[30px]">{{ userStore.firstName }}</span>
          </UserAvatar>
          <div class="mt-4">
            <div class="flex py-1">
              <div class="text-black w-[80px]">昵称</div>
              <div>{{ userStore.realName }}</div>
            </div>
            <div class="flex py-1">
              <div class="text-black w-[80px]">手机号</div>
              <div>{{ userStore.telephone }}</div>
            </div>
            <div class="flex py-1">
              <div class="text-black w-[80px]">账号</div>
              <div>{{ userStore.userId }}</div>
            </div>
            <div class="flex py-1">
              <div class="text-black w-[80px]">密码</div>
              <el-popover
                trigger="click"
                placement="right-start"
                :width="300"
                :visible="resetPasswordVisible"
              >
                <template #reference>
                  <div
                    class="text-blue-400"
                    @click="resetPasswordVisible = true"
                  >
                    修改
                  </div>
                </template>
                <div>
                  <div>
                    <el-input
                      type="password"
                      show-password
                      placeholder="请输入旧密码"
                      v-model="password.old"
                      class="mb-2"
                    />
                    <el-input
                      type="password"
                      show-password
                      placeholder="请输入新密码"
                      v-model="password.newX"
                      class="mb-2"
                    />
                    <el-input
                      type="password"
                      show-password
                      placeholder="请再次输入新密码"
                      v-model="password.newY"
                    />
                  </div>
                  <div class="pt-1 text-xs">
                    密码需要同时含有字母和数字，至少需要8位
                  </div>
                  <div class="mt-4 flex justify-center items-center">
                    <el-button @click="resetPasswordVisible = false"
                      >取消</el-button
                    >
                    <el-button type="primary" @click="handleResetPassword"
                      >确定</el-button
                    >
                  </div>
                </div>
              </el-popover>
            </div>
          </div>
        </div>
        <div class="flex justify-center items-center mt-16">
          <el-button
            type="danger"
            size="large"
            :loading="logoutButtonLoading"
            plain
            class="logout-btn"
            @click="handleLogout"
            >退出登录</el-button
          >
        </div>
      </el-tab-pane>
      <el-tab-pane label="系统设置">
        <div class="system-setting-item">
          <div class="label">发送消息</div>
          <el-select
            v-model="sendMessageKey"
            @change="handleSendMessageKeyChange"
          >
            <el-option
              v-for="item in sendMessageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="system-setting-item">
          <div class="label">截图快捷键</div>
          <el-input
            v-model="screenshotsKey"
            :maxlength="1"
            :minlength="1"
            @blur="handleSetScreenshotsKey"
          >
            <template #prepend
              >{{ isWindows ? "Ctrl" : "Command" }} + Shift +
            </template>
          </el-input>
        </div>
      </el-tab-pane>
      <el-tab-pane label="关于">
        <div class="pb-4 text-lg font-medium text-black">
          飞讯 v{{ pkg.version }}
        </div>
        <div>
          <div class="pb-4 text-black font-normal">功能介绍</div>
          <div class="text-gray-500 h-[160px] overflow-y-auto leading-[24px]">
            <div v-for="(item, index) in changeLogs" :key="index" class="mb-2">
              {{ index + 1 }} . {{ item }}
            </div>
          </div>
        </div>
        <div class="h-16 px-2 flex justify-between items-center">
          <div>
            <a href="https://www.iflytek.com/" target="_blank">用户协议</a>
            <a href="https://www.iflytek.com/" target="_blank" class="pl-2"
              >隐私政策</a
            >
          </div>
          <div>
            <FeedbackDialog />
            <el-button
              type="primary"
              size="large"
              :loading="checkVersionLoading"
              @click="handleVersionUpdate"
              >检测更新</el-button
            >
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SideSetting",
});
</script>

<script lang="ts" setup>
import { ref, watch, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import JSEncrypt from "jsencrypt";
import { ElMessageBox, ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { logout, applyToUpdatePassword, updatePassword } from "@/api/login";
import {
  REPLY_AUDIO_OR_VIDEO_REQUEST,
  REGISTER_SCREENSHOTS,
  VERSION_CHECK,
  HAS_NEW_VERSION,
} from "@/../../main/channel";
import { handleReplayAudioOrVideoRequest } from "@/views/login/index.vue";
import pkg from "../../../../package.json";
import { getCacheAvator } from "@/utils/avatar";
import {
  ENTER_KEY_NAME,
  CTRL_ENTER_KEY_NAME,
  // COMMAND_ENTER_KEY_NAME,
  SEND_MESSAGE_ITEM_NAME,
  SCREENSHOTS_ITEM_NAME,
  DEFAULT_SCREENSHOTS_KEY,
} from "@/constant/message";
import FeedbackDialog from "@/components/FeedbackDialog/index.vue";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { CreateDialogWidth } from "@/constant/common";
const userStore = useUserStore();
const messageStore = useMessageStore();
const dialogVisible = ref(false);
const logoutButtonLoading = ref(false);
const checkVersionLoading = ref(false);

watch(
  () => dialogVisible.value,
  (val) => {
    if (!val) {
      resetPasswordVisible.value = false;
    }
  }
);

const isWindows = window["$platform"] === "win32";
const sendMessageOptions = [
  {
    label: `Enter 发送，${
      isWindows ? CTRL_ENTER_KEY_NAME : CTRL_ENTER_KEY_NAME
    } 换行`,
    value: ENTER_KEY_NAME,
  },
  {
    label: `${
      isWindows ? CTRL_ENTER_KEY_NAME : CTRL_ENTER_KEY_NAME
    } 发送，Enter 换行`,
    value: isWindows ? CTRL_ENTER_KEY_NAME : CTRL_ENTER_KEY_NAME,
  },
];
const savedSendMessageKey =
  localStorage.getItem(SEND_MESSAGE_ITEM_NAME) || ENTER_KEY_NAME;
const sendMessageKey = ref(savedSendMessageKey);
const handleSendMessageKeyChange = (val = ENTER_KEY_NAME) => {
  localStorage.setItem(SEND_MESSAGE_ITEM_NAME, val);
};

let savedScreenshotsKey =
  localStorage.getItem(SCREENSHOTS_ITEM_NAME) || DEFAULT_SCREENSHOTS_KEY;
const screenshotsKey = ref(savedScreenshotsKey);
const handleSetScreenshotsKey = (e: any) => {
  const value = e.target.value || savedScreenshotsKey;
  screenshotsKey.value = value[0].toUpperCase();
  window.ipcRenderer.send(
    REGISTER_SCREENSHOTS,
    savedScreenshotsKey,
    screenshotsKey.value
  );
  savedScreenshotsKey = screenshotsKey.value;
  localStorage.setItem(SCREENSHOTS_ITEM_NAME, screenshotsKey.value);
};
onMounted(() => {
  window.ipcRenderer.send(
    REGISTER_SCREENSHOTS,
    DEFAULT_SCREENSHOTS_KEY,
    savedScreenshotsKey
  );
});

const changeLogs = ref([
  "【消息】支持发送失败后重试",
  "【消息】支持群通知消息",
  "【消息】支持任务通知和日程通知消息",
  "【消息】支持显示历史消息时间",
  "【联系人】支持从我的群组发起群组会话",
  "【Pin】支持Pin通知和未回执数量显示",
  "【Pin】支持附件下载",
]);
const handleVersionUpdate = () => {
  checkVersionLoading.value = true;
  window.ipcRenderer.once(HAS_NEW_VERSION, (e, data) => {
    if (!data) {
      ElMessage.info({ message: "已是最新版本" });
    }
    checkVersionLoading.value = false;
  });
  window.ipcRenderer.send(VERSION_CHECK);
};

const resetPasswordVisible = ref(false);
const password = reactive({
  old: "",
  newX: "",
  newY: "",
});
const handleResetPassword = async () => {
  if (password.newX !== password.newY) {
    ElMessage.error({ message: "两次输入密码不一致" });
    return;
  }

  if (password.old === password.newX) {
    ElMessage.error({ message: "新密码和旧密码不能一样" });
    return;
  }

  if (
    password.newX.length < 8 ||
    !/^(?![^a-zA-Z]+$)(?!\D+$)/.test(password.newX)
  ) {
    ElMessage.error({ message: "密码需要同时含有字母和数字，至少需要8位" });
    return;
  }

  // 校验旧密码
  const { publicKey } = await applyToUpdatePassword({
    password: password.old,
  }).catch((err) => {
    ElMessage.error({ message: "旧密码输入错误" });
  });
  if (!publicKey) {
    return;
  }

  // 申请新密码
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encrypted = encrypt.encrypt(password.newX) || "";
  updatePassword({ password: encrypted })
    .then(() => {
      ElMessage.success("密码修改成功");
      resetPasswordVisible.value = false;
      logoutFn();
    })
    .catch((err: any) => {
      ElMessage.error("密码修改失败：" + err);
    });
};

const router = useRouter();
const logoutFn = () => {
  logout({ userId: userStore.userId })
    .then(() => {
      // 退出时移除注册对主进程的监听，不能调用removeAllListeners，否则会导致消息回调失效
      window.ipcRenderer.removeListener(
        REPLY_AUDIO_OR_VIDEO_REQUEST,
        handleReplayAudioOrVideoRequest
      );

      window.$imRender.removeIMConversationListener();
      window.$imRender.detachMsgListener();
      window.$imRender.logout();

      messageStore.$reset();
    })
    .catch((err) => {
      ElMessage({
        message: `${err}`,
        type: "error",
      });
    })
    .finally(() => {
      window.localStorage.removeItem("user");
      dialogVisible.value = false;
      router.replace({ path: "/" });
    });
};
const handleLogout = () => {
  if (logoutButtonLoading.value) return;
  logoutButtonLoading.value = true;
  ElMessageBox.confirm("退出当前账号后将无法收到新通知，是否确认退出?", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      logoutFn();
    })
    .catch(() => {
      console.log("取消退出登录");
    })
    .finally(() => {
      logoutButtonLoading.value = false;
    });
};
</script>

<style lang="less" scoped>
.menu-icon {
  width: 24px;
  height: 24px;
}
.system-setting-item {
  padding: 12px;
  display: flex;
  align-items: center;
  color: #000;
  .label {
    width: 100px;
  }
  :deep(.el-select) {
    width: 320px;
  }
  :deep(.el-input) {
    width: 320px;
  }
}
</style>
