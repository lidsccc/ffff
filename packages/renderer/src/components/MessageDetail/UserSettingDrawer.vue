<template>
  <div>
    <img
      src="@/assets/more-icon.png"
      @click="openDrawer"
      class="w-6 cursor-pointer select-none more-icon"
    />
    <el-drawer :size="DrawerSize" v-model="drawer" direction="rtl">
      <template #title>
        <div class="text-black">个人设置</div>
      </template>
      <template #default>
        <div class="flex justify-between items-center select-none">
          <div class="flex items-center">
            <UserAvatar
              :size="44"
              :src="messageStore.activeRecordItem?.conversationAvatar"
              :id="messageStore.activeRecordId"
              :name="messageStore.activeRecordItem?.conversationName"
            />
            <div class="ml-4">
              {{ messageStore.activeRecordItem?.conversationName }}
            </div>
          </div>
          <img
            src="@/assets/share-icon.png"
            class="w-4 h-4 cursor-pointer"
            @click="showContactSelectDialog"
          />
        </div>
        <div
          class="flex items-center mt-4 cursor-pointer select-none"
          @click="handleVisibleChange(true)"
        >
          <img src="@/assets/add-circle.png" class="w-11 h-11" />
          <div class="ml-4">创建群组</div>
        </div>
        <el-divider />
        <CommonSettingSwitch />
        <CreateGroupDialog
          :selected="selected"
          :visible="dialogVisible"
          @on-change-visible="handleVisibleChange"
          @on-confirm="onConfirm"
          @on-cancel="onCancel"
        />
        <ContactSelect
          :visible="contactSelectVisible"
          :showGroup="true"
          @on-visible-change="handleContactSelectVisibleChange"
          @on-confirm="onContactSelectConfirm"
          @on-cancel="onContactSelectCancel"
        />
      </template>
      <!-- <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="confirmClick">确定</el-button>
      </div>
    </template> -->
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserSettingDrawer",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import CommonSettingSwitch from "./CommonSettingSwitch.vue";
import { DrawerSize } from "@/constant/common";
import CreateGroupDialog from "@/components/CreateGroupDialog/index.vue";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { useMessageStore } from "@/store/modules/message";
import { detailUser } from "@/api/user";
import { CustomMessageType } from "@/types/message";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import UserAvatar from "@/components/UserAvatar/index.vue";

const userStore = useUserStore();
const messageStore = useMessageStore();

const selected = computed(() => {
  const {
    conversationId: id,
    conversationName: name,
    conversationAvatar: iconUrl,
  } = messageStore.activeRecordItem;
  return [
    { id, name, iconUrl },
    {
      id: userStore.userId,
      name: userStore.realName,
      iconUrl: userStore.avatar,
    },
  ];
});

const drawer = ref(false);
const openDrawer = () => {
  drawer.value = true;
};
// const cancelClick = () => {
//   drawer.value = false;
// };
// const confirmClick = () => {
//   drawer.value = false;
// };

const dialogVisible = ref(false);
const handleVisibleChange = (visible: boolean) => {
  dialogVisible.value = visible;
};
const onConfirm = () => {
  dialogVisible.value = false;
  drawer.value = false;
};
const onCancel = () => {
  dialogVisible.value = false;
};

const contactSelectVisible = ref(false);
const showContactSelectDialog = () => {
  contactSelectVisible.value = true;
};
const handleContactSelectVisibleChange = (visible: boolean) => {
  contactSelectVisible.value = visible;
};
const onContactSelectConfirm = async (userList: any[]) => {
  if (userList.length === 0) {
    contactSelectVisible.value = false;
    return;
  }
  if (userList.length > 1) {
    ElMessage.warning({ message: "只能选择一位联系人" });
    return;
  }
  const userDetail = await detailUser({ id: messageStore.activeRecordId });
  const customContent = {
    type: CustomMessageType.SHARE_BUSINESS_CARD,
    organizationMember: userDetail,
  };
  const param = {
    content: { text: JSON.stringify(customContent) },
    receiver: undefined,
    groupID: undefined,
    callback: ([code, desc, jsonParams]: any) => {
      console.log("分享名片成功", [code, desc, jsonParams]);
      if (code !== 0 || !jsonParams) {
        return;
      }
      try {
        const message = JSON.parse(jsonParams);
        messageStore.addPushMessageContent(message);
      } catch (err) {
        window.$log.error("分享名片失败:", [code, desc, jsonParams]);
      }
    },
  };
  const { id, isGroup } = userList[0];
  if (isGroup) {
    param.groupID = id;
  } else {
    param.receiver = id;
  }
  window.$imRender.sendCustomMessage(param);
  contactSelectVisible.value = false;
};
const onContactSelectCancel = () => {
  contactSelectVisible.value = false;
};
</script>

<style lang="less" scoped>
.more-icon {
  -webkit-app-region: no-drag;
}
</style>
