<template>
  <div @click="visible = true">
    <slot></slot>
  </div>
  <el-dialog
    v-model="visible"
    :title="props.title"
    width="60%"
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
              :label="item.userId"
              :modelValue="
                selectedContacts.some((i) => i.userId === item.userId)
              "
              @change="(checked) => handleSelect(item, checked)"
              :disabled="selectedContacts.length >= props.max"
            >
              <UserAvatar
                class="ml-2"
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
            </el-checkbox>
          </div>
        </div>
      </div>
      <div class="w-1/2 pl-8 pr-2">
        <div class="flex justify-between mb-2">
          <div class="title">已选群员</div>
          <div class="text-gray">已选{{ selectedContacts?.length }}人</div>
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
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="onConfirm"
        :disabled="confirmBtnDisabled"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "GroupMemberSelector",
});
</script>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import { get } from "lodash-es";
import UserAvatar from "@/components/UserAvatar/index.vue";

interface Props {
  title?: string;
  memberList?: object[];
  selectedList?: object[];
  min?: number;
  max?: number;
}
const props = withDefaults(defineProps<Props>(), {
  title: "选择成员",
  min: 1,
  max: 9999,
});
const emits = defineEmits(["on-confirm"]);
const visible = ref(false);
const input = ref("");
const memberList = computed(() =>
  props.memberList?.filter((item) =>
    get(item, "user.realName", "").includes(input.value)
  )
);
// 添加
const selectedContacts = ref([]);
const handleSelect = (item, checked) => {
  if (checked) {
    selectedContacts.value?.push(item);
  } else {
    selectedContacts.value = selectedContacts.value?.filter(
      (i) => i.userId !== item.userId
    );
  }
};
// 删除
const deleteSelectedContact = (item) => {
  selectedContacts.value = selectedContacts.value?.filter(
    (i) => i.userId !== item.userId
  );
};

const onConfirm = () => {
  emits("on-confirm", selectedContacts.value);
  selectedContacts.value = [];
  visible.value = false;
};
// 已选中
watch(
  () => props.selectedList,
  () => {
    if (props.selectedList?.length)
      selectedContacts.value = selectedContacts.value.concat(
        props.selectedList
      );
  }
);
// 按钮状态
const confirmBtnDisabled = ref(true);
watch(
  () => selectedContacts.value.length,
  () => {
    confirmBtnDisabled.value =
      selectedContacts.value.length < props.min ||
      selectedContacts.value.length > props.max;
  }
);
</script>

<style lang="less" scoped>
.member-list {
  height: 240px;
  :deep(.el-checkbox__label) {
    @apply flex items-center;
  }
}
</style>
