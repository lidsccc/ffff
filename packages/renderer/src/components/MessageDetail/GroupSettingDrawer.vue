<template>
  <img
    src="@/assets/more-icon.png"
    @click="openDrawer"
    class="w-6 cursor-pointer select-none more-icon"
  />
  <el-drawer
    :size="DrawerSize"
    v-model="drawer"
    direction="rtl"
    custom-class="group-setting-drawer"
  >
    <template #title>
      <div class="text-black">群组设置</div>
    </template>
    <template #default>
      <div class="select-none" v-loading="data.loading">
        <div class="group-item">
          <div class="label">群头像</div>
          <div class="flex items-center">
            <ImageCropUpload
              @crop-success="changeGroupAvatar"
              v-model="isImageCropUploadShow"
              :width="300"
              :height="300"
              :noSquare="true"
            />
            <el-popover
              :visible="popoverVisible"
              placement="right-start"
              :width="300"
            >
              <div class="flex">
                <el-avatar
                  :src="data.detail.iconUrl || Default_Group_Avatar"
                  shape="square"
                  :size="200"
                />
                <div class="ml-4 flex flex-col">
                  <div>
                    <el-button size="small" @click="popoverVisible = false"
                      >关闭</el-button
                    >
                  </div>
                  <div v-if="hasManageRights" class="mt-2">
                    <el-button
                      size="small"
                      @click="
                        popoverVisible = false;
                        isImageCropUploadShow = true;
                      "
                      >修改</el-button
                    >
                  </div>
                </div>
              </div>
              <template #reference>
                <el-avatar
                  :size="36"
                  :src="data.detail.iconUrl || Default_Group_Avatar"
                  @click="popoverVisible = true"
                />
              </template>
            </el-popover>
            <img
              v-if="hasManageRights"
              src="@/assets/edit-dark-icon.png"
              class="w-4 h-4 ml-2 cursor-pointer"
              @click="isImageCropUploadShow = true"
            />
          </div>
        </div>
        <div class="group-item">
          <div class="label">群名称</div>
          <div class="flex items-center">
            <div class="label mr-1">
              <el-input
                v-if="data.isEditGroupName"
                v-model="data.detail.groupName"
                @blur="handleUpdateGroupName"
              />
              <div class="truncate" v-else>
                {{ data.detail.groupName }}
              </div>
            </div>
            <img
              v-if="hasManageRights && !data.isEditGroupName"
              @click="() => (data.isEditGroupName = true)"
              src="@/assets/edit-dark-icon.png"
              class="w-4 h-4 ml-2 cursor-pointer"
            />
          </div>
        </div>
        <div class="group-item">
          <div class="label">群二维码</div>
          <el-popover :width="380" placement="bottom-start" trigger="click">
            <template #reference>
              <div class="flex cursor-pointer">
                <img src="@/assets/qr-icon.png" class="w-4 h-4 mr-1" />
                <img src="@/assets/right-arrow-icon.png" class="w-4 h-4" />
              </div>
            </template>
            <QrCode :data="data.detail" />
          </el-popover>
        </div>

        <GroupManagement
          @on-group-change="handleTransferGroupLeaderVisible"
          @on-fetch-group-member="fetchGroupMember"
          :groupDetail="data.detail"
          :groupMember="data.groupMember.list"
          v-loading="data.groupMember.loading"
          v-if="isLeader"
        />
        <div class="h-11 flex justify-between items-center">
          <div class="label">群公告</div>
          <img
            v-if="hasManageRights"
            @click="() => (data.isEditGroupAnnouncement = true)"
            src="@/assets/edit-dark-icon.png"
            class="w-4 h-4 cursor-pointer"
          />
          <EditGroupDialog
            :hasManageRights="hasManageRights"
            :visible="data.isEditGroupAnnouncement"
            :groupDetail="data.detail"
            @on-change-visible="
              (visible) => (data.isEditGroupAnnouncement = visible)
            "
            @on-confirm="fetchGroupDetail"
          />
        </div>
        <div class="announcement">
          {{ data.detail.announcement || "" }}
        </div>
        <el-divider class="divider" />
        <el-input
          v-model="data.groupMemberKeyword"
          placeholder="搜索联系人"
          :prefix-icon="Search"
        />
        <div v-loading="data.groupMember.loading" class="mt-4 flex gap-2">
          <div class="flex flex-wrap gap-3">
            <div
              v-for="item in filteredGroupMemberList"
              :key="item.userId"
              class="w-10 flex flex-col items-center"
            >
              <UserAvatar
                :size="24"
                :src="get(item, 'user.avatar')"
                :name="get(item, 'user.realName')"
                :id="get(item, 'user.userId')"
              >
                <span>{{ get(item, "user.realName[0]") }}</span>
              </UserAvatar>
              <div class="w-10 mt-1 text-xs text-center truncate">
                {{ get(item, "user.realName") }}
              </div>
            </div>

            <div
              class="w-10 flex flex-col justify-center items-center rounded hover:bg-gray-100"
            >
              <img
                src="@/assets/add-small-icon.png"
                class="w-6 h-6 cursor-pointer"
                @click="data.addMemberDialogVisible = true"
              />
            </div>

            <div
              v-if="hasManageRights"
              class="w-10 flex flex-col justify-center items-center rounded hover:bg-gray-100"
              @click="data.deleteMemberDialogVisible = true"
            >
              <img
                src="@/assets/delete-small-icon.png"
                class="w-6 h-6 cursor-pointer"
              />
            </div>
            <ContactSelect
              :visible="data.addMemberDialogVisible"
              @on-visible-change="handleContactSelectVisibleChange"
              @on-cancel="data.addMemberDialogVisible = false"
              @on-confirm="confirmContactSelect"
            />
            <DeleteGroupMemberDialog
              :memberList="data.groupMember.list"
              :visible="data.deleteMemberDialogVisible"
              @on-change-visible="changeDeleteMemberDialogStatus"
              @on-confirm="confirmDeleteMember"
            />
          </div>
        </div>
        <el-divider class="divider" />
        <CommonSettingSwitch :isGroup="true" />
      </div>
    </template>
    <template #footer>
      <div v-if="!data.loading" style="flex: auto">
        <el-button @click="handleQuitGroup">退出群组</el-button>
        <el-button
          v-if="userStore.userId === data.detail.groupLeaderId"
          type="primary"
          @click="handleDeleteGroup"
          >解散群组</el-button
        >
        <el-dialog v-model="data.isDisbandGroupDialog" width="50%">
          <div class="flex flex-col items-center">
            <img src="@/assets/confirm.png" />
            <div class="my-4 font-medium">
              你是群主，建议退出前将群主转移给其他群成员
            </div>
            <div class="flex justify-center items-center">
              <el-button @click="() => (data.isDisbandGroupDialog = false)"
                >取消</el-button
              >
              <el-button
                type="primary"
                @click="handleTransferGroupLeaderVisible(true)"
                >转让群主</el-button
              >
            </div>
          </div>
        </el-dialog>
        <TransferGroupLeaderDialog
          :groupMemberList="data.groupMember.list"
          :visible="data.isTransferLeaderDialog"
          @on-visible-change="(val) => (data.isTransferLeaderDialog = val)"
          @on-confirm="handleTransferGroupLeader"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "GroupSettingDrawer",
});
</script>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import CommonSettingSwitch from "./CommonSettingSwitch.vue";
import QrCode from "@/components/QrCode/index.vue";
import {
  detailGroupV2,
  listGroupMemberV2,
  updateGroupAvatar,
  addGroupMember,
  removeGroupMember,
  deleteGroup,
  updateGroup,
} from "@/api/message";
import ImageCropUpload from "vue-image-crop-upload";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { GroupMemberType } from "@/enums/message";
import { DrawerSize } from "@/constant/common";
import EditGroupDialog from "@/components/EditGroupDialog/index.vue";
import DeleteGroupMemberDialog from "@/components/DeleteGroupMemberDialog/index.vue";
import TransferGroupLeaderDialog from "@/components/TransferGroupLeaderDialog/index.vue";
import { get } from "lodash-es";
import { ElMessage, ElMessageBox } from "element-plus";
import { Default_Group_Avatar } from "@/constant/base64";
import { dataURLtoBlob } from "@/utils/img";
import ContactSelect from "@/components/ContactSelect/index.vue";
import GroupManagement from "@/components/GroupManagement/index.vue";
import UserAvatar from "@/components/UserAvatar/index.vue";

interface Props {
  groupId: string;
}
const props = defineProps<Props>();
const emits = defineEmits(["on-group-change"]);

const userStore = useUserStore();
const messageStore = useMessageStore();

const isImageCropUploadShow = ref(false);
const popoverVisible = ref(false);
const data = reactive({
  loading: true,
  detail: {},
  isEditGroupName: false,
  isEditGroupAnnouncement: false,
  addMemberDialogVisible: false,
  deleteMemberDialogVisible: false,
  groupMemberKeyword: "",
  groupMember: {
    loading: true,
    list: [],
    pageNum: 1,
    pageSize: 100000, // 全量拉取(目前群成员不超过500)
  },
  isDisbandGroupDialog: false,
  isTransferLeaderDialog: false,
});
// 是否为群主
const isLeader = computed(
  () => data.detail.memberType === GroupMemberType.LEADER
);

const hasManageRights = computed(() =>
  [GroupMemberType.LEADER, GroupMemberType.MANAGER].includes(
    data.detail.memberType
  )
);
const filteredGroupMemberList = computed(() => {
  return data.groupMember.list.filter((item) =>
    get(item, "user.realName", "").includes(data.groupMemberKeyword)
  );
});

const fetchGroupDetail = () =>
  detailGroupV2({
    groupId: props.groupId,
    userId: userStore.userId,
  })
    .then((res) => {
      data.loading = false;
      data.detail = res;
      return res;
    })
    .catch((err) => {
      ElMessage.error({ message: err });
    });
const fetchGroupMember = () => {
  data.groupMember.loading = true;
  listGroupMemberV2({
    groupId: props.groupId,
    userId: userStore.userId,
    pageNum: data.groupMember.pageNum,
    pageSize: data.groupMember.pageSize,
  })
    .then(({ items }) => {
      data.groupMember.list = items;
      data.groupMember.loading = false;
    })
    .catch((err) => {
      ElMessage.error({ message: err });
    });
};
const drawer = ref(false);
watch(drawer, () => {
  if (drawer.value) {
    fetchGroupDetail();
    fetchGroupMember();
  }
});
const openDrawer = () => {
  drawer.value = true;
};
const closeDrawer = () => {
  drawer.value = false;
};
const quitGroup = () => {
  return removeGroupMember({
    groupId: data.detail.groupId,
    userId: userStore.userId,
    member: [],
  })
    .then(() => {
      ElMessage.success({ message: "退出群组成功" });
      drawer.value = false;
    })
    .catch((err) => {
      ElMessage.error({ message: `退出群组失败：${err}` });
    });
};
const handleQuitGroup = () => {
  // 群主不能直接退 要先转让群主
  if (userStore.userId === data.detail.groupLeaderId) {
    data.isDisbandGroupDialog = true;
    return;
  }
  ElMessageBox.confirm("退出群组后将无法查看和收发群消息，是否确定退出？").then(
    () => {
      quitGroup();
      const { groupId }: any = data.detail;
      messageStore.deleteConversation(groupId);
      window.$imRender.deleteConversationByChatId(groupId); // 删除本地会话层
    }
  );
};

const handleDeleteGroup = () => {
  const { groupId }: any = data.detail;
  deleteGroup({
    groupId,
    userId: userStore.userId,
  })
    .then(() => {
      ElMessage.success({ message: "删除群组成功" });
      data.isDisbandGroupDialog = false;
      drawer.value = false;
      messageStore.deleteConversation(groupId);
      window.$imRender.deleteConversationByChatId(groupId); // 删除本地会话层
    })
    .catch((err: any) => {
      ElMessage.error({ message: `删除群组失败：${err}` });
    });
};

const changeGroupAvatar = (imageDataUrl: string) => {
  const form = new FormData();
  form.append("avatar", dataURLtoBlob(imageDataUrl));
  const { groupId } = data.detail;
  updateGroupAvatar(groupId, form)
    .then(() => {
      // ElMessage.success({ message: "修改群头像成功" });
      fetchGroupDetail().then(({ groupName, iconUrl, isOfficial }) => {
        messageStore.updateNameAndAvatarCache(groupId, {
          name: groupName,
          avatar: iconUrl,
          isOfficial,
        });
        messageStore.updateConversation({
          ...messageStore.activeRecordItem,
          conversationAvatar: iconUrl,
        });
      });
    })
    .catch((err) => {
      ElMessage.error({ message: `修改群头像失败：${err}` });
    });
};

const handleContactSelectVisibleChange = (val: boolean) => {
  data.addMemberDialogVisible = val;
};
const confirmContactSelect = (users: any[]) => {
  addGroupMember({
    groupId: data.detail.groupId,
    userId: userStore.userId,
    member: users.map(({ id }: { id: string }) => id),
  })
    .then(({ groupName, iconUrl }: any) => {
      ElMessage.success({ message: "邀请群成员成功" });
      // 更新群名称
      messageStore.updateConversation({
        ...messageStore.activeRecordItem,
        conversationName: groupName,
        conversationAvatar: iconUrl,
      });
      data.addMemberDialogVisible = false;
      fetchGroupMember();
      emits("on-group-change");
    })
    .catch((err) => {
      ElMessage.error({ message: `邀请群成员失败：${err}` });
    });
};
const changeDeleteMemberDialogStatus = (val) => {
  data.deleteMemberDialogVisible = val;
};
const confirmDeleteMember = () => {
  fetchGroupMember();
  changeDeleteMemberDialogStatus(false);
  emits("on-group-change");
};
// 是否需要退出群聊
const needQuitGroup = ref(false);
const handleTransferGroupLeaderVisible = (needQuit: boolean) => {
  needQuitGroup.value = needQuit;
  data.isTransferLeaderDialog = true;
};
const handleTransferGroupLeader = () => {
  data.isTransferLeaderDialog = false;
  data.isDisbandGroupDialog = false;
  needQuitGroup.value
    ? quitGroup().then(() => {
        closeDrawer();
      })
    : closeDrawer();
};

const handleUpdateGroupName = () => {
  const { groupId }: any = data.detail;
  updateGroup({
    groupId,
    userId: userStore.userId,
    name: data.detail.groupName,
    isGroupNameEdit: 1,
  })
    .then(() => {
      data.isEditGroupName = false;
      fetchGroupDetail().then(({ groupName, iconUrl }) => {
        // 更新群名称
        messageStore.updateConversation({
          ...messageStore.activeRecordItem,
          conversationName: groupName,
          conversationAvatar: iconUrl,
        });
      });
    })
    .catch((err) => {
      ElMessage.error({ message: `更新群组名称失败：${err}` });
    });
};
</script>

<style lang="less">
.group-setting-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding-top: 12px;
  }
}
</style>

<style lang="less" scoped>
.more-icon {
  -webkit-app-region: no-drag;
}
.group-item {
  @apply h-11 flex justify-between items-center border-b;
}
.divider {
  margin: 16px 0;
}
.label {
  max-width: 260px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.announcement {
  white-space: pre;
}
</style>
