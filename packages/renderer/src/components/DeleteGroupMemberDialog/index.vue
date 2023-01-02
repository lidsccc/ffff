<template>
  <el-dialog
    :modelValue="props.visible"
    @update:model-value="changeVisible"
    title="移除群员"
    width="80%"
    destroy-on-close
  >
    <div class="flex divide-x">
      <div class="w-1/2 pl-2 pr-8">
        <el-input
          class="py-2"
          v-model="input"
          placeholder="搜索联系人"
          :prefix-icon="Search"
        />
        <div class="member-list mt-4 overflow-y-auto">
          <div v-for="item in memberList" :key="item.userId">
            <el-checkbox
              :modelValue="
                selectedContacts.some((i) => i.userId === item.userId)
              "
              @change="(checked) => handleSelect(item, checked)"
            >
              <UserAvatar
                :size="24"
                class="ml-2"
                :src="get(item, 'user.avatar')"
                :name="get(item, 'user.realName[0]')"
                :id="get(item, 'user.userId')"
              >
                <span>{{ get(item, "user.realName[0]") }}</span>
              </UserAvatar>
              <div class="ml-4">
                {{ get(item, "user.realName") }}
              </div>
            </el-checkbox>
          </div>
        </div>
      </div>
      <div class="w-1/2 pl-8 pr-2">
        <div class="flex justify-between mb-2">
          <div class="title">已选联系人</div>
          <div class="text-gray">已选{{ selectedContacts.length }}人</div>
        </div>
        <div class="h-64 overflow-y-auto">
          <div
            v-for="item in selectedContacts"
            :key="item.id"
            class="flex justify-between items-center py-2"
          >
            <div class="flex items-center">
              <UserAvatar
                :size="24"
                :src="get(item, 'user.avatar')"
                :name="get(item, 'user.realName[0]')"
                :id="get(item, 'user.userId')"
              >
                <span>{{ get(item, "user.realName[0]") }}</span>
              </UserAvatar>
              <div class="ml-4">
                {{ get(item, "user.realName") }}
              </div>
            </div>
            <div
              @click="deleteSelectedContact(item)"
              class="w-6 h-6 flex items-center justify-center cursor-pointer rounded hover:bg-gray-300"
            >
              <img src="@/assets/close-btn.png" class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="changeVisible(false)">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DeleteGroupMemberDialog",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { Search } from "@element-plus/icons-vue";
import { removeGroupMember } from "@/api/message";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import { ElMessage } from "element-plus";
import { get } from "lodash-es";
import UserAvatar from "@/components/UserAvatar/index.vue";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  visible: boolean;
  memberList: object[];
}
const props = defineProps<Props>();
const emits = defineEmits(["on-change-visible", "on-confirm"]);

const input = ref("");
const memberList = computed(() =>
  props.memberList.filter((item) =>
    get(item, "user.realName", "").includes(input.value)
  )
);

const selectedContacts = ref([]);
const handleSelect = (item, checked) => {
  if (checked) {
    selectedContacts.value.push(item);
  } else {
    selectedContacts.value = selectedContacts.value.filter(
      (i) => i.userId !== item.userId
    );
  }
};
const deleteSelectedContact = (item) => {
  selectedContacts.value = selectedContacts.value.filter(
    (i) => i.userId !== item.userId
  );
};

const changeVisible = (visible) => {
  if (!visible) {
    input.value = "";
    selectedContacts.value = [];
  }
  emits("on-change-visible", visible);
};

const onConfirm = () => {
  removeGroupMember({
    groupId: get(selectedContacts.value, "[0].groupId"),
    userId: userStore.userId,
    member: selectedContacts.value.map((item) => item.userId),
  })
    .then(({ groupName, iconUrl }: any) => {
      ElMessage.success({ message: "移除群成员成功" });
      // 更新群名称
      messageStore.updateConversation({
        ...messageStore.activeRecordItem,
        conversationName: groupName,
        conversationAvatar: iconUrl,
      });
      emits("on-confirm");
    })
    .catch((err) => {
      ElMessage.success({ message: `移除群成员失败：${err}` });
    });
};
</script>

<style lang="less" scoped>
.member-list {
  height: 240px;
  :deep(.el-checkbox__label) {
    @apply flex items-center;
  }
}
</style>
