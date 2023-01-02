<template>
  <el-dialog :modelValue="props.visible" width="50%" @closed="closeDialog">
    <div class="text-left">
      <div class="font-medium">群成员</div>
      <el-input
        class="my-4"
        v-model="input"
        placeholder="搜索群成员"
        :prefix-icon="Search"
      />
      <div class="overflow-y-auto" style="height: 200px">
        <div v-for="item in list" :key="item.userId">
          <el-radio
            v-model="radio"
            :disabled="item.memberType === GroupMemberType.LEADER"
            :label="item.userId"
          >
            <div class="flex">
              <UserAvatar
                :size="24"
                :src="get(item, 'user.avatar')"
                :name="get(item, 'user.realName[0]')"
                :id="get(item, 'user.userId')"
              >
                <span>{{ get(item, "user.realName[0]") }}</span>
              </UserAvatar>
              <div class="pl-4">
                {{ get(item, "user.realName") }}
              </div>
            </div>
          </el-radio>
        </div>
      </div>
      <div class="flex justify-center items-center">
        <el-button @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          @click="updateGroupLeader"
          :disabled="!radio.length"
          >确定</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "IsTransferLeaderDialog",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { Search } from "@element-plus/icons-vue";
import { updateGroupMaintainer } from "@/api/message";
import { get } from "lodash-es";
import { GroupMemberType } from "@/enums/message";
import { ElMessage } from "element-plus";
import UserAvatar from "@/components/UserAvatar/index.vue";

interface Props {
  visible: boolean;
  groupMemberList: object[];
}

const props = defineProps<Props>();
const emits = defineEmits(["on-visible-change", "on-confirm"]);

const input = ref("");
const list = computed(() => {
  return props.groupMemberList.filter((item) =>
    get(item, "user.realName").includes(input.value)
  );
});
const radio = ref("");

const closeDialog = () => {
  emits("on-visible-change", false);
};

const updateGroupLeader = () => {
  updateGroupMaintainer({
    newOwner: radio.value,
    groupId: get(list.value, "[0].groupId"),
    memberType: GroupMemberType.LEADER,
  })
    .then(() => {
      ElMessage.success({ message: "转让群主成功" });
      emits("on-confirm");
    })
    .catch((err) => {
      ElMessage.error({ message: `转让群主失败：${err}` });
    });
};
</script>

<style lang="less" scoped></style>
