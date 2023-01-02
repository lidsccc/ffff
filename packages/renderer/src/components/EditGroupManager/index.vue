<template>
  <GroupMemberSelector
    @on-confirm="confirm"
    :memberList="selectableMember"
    :selectedList="managerList"
    :max="3"
    :min="0"
    title="添加管理员"
  >
    <slot></slot>
  </GroupMemberSelector>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EditGroupManager",
});
</script>

<script lang="ts" setup>
import GroupMemberSelector from "@/components/GroupMemberSelector/index.vue";
import { computed } from "vue";
import { updateGroupManager } from "@/api/message";
import { get } from "lodash-es";
import { GroupMemberType } from "@/enums/message";
import { ElMessage } from "element-plus";

interface Props {
  memberList?: object[];
}
const props = defineProps<Props>();
const emits = defineEmits(["on-manager-change"]);

const confirm = (list: any) => {
  const userIdList = list.map((item) => item.userId);
  updateGroupManager({
    newOwner: userIdList,
    groupId: get(props.memberList, "[0].groupId"),
  })
    .then(() => {
      ElMessage.success({ message: "编辑管理员成功" });
      emits("on-manager-change");
    })
    .catch((err) => {
      ElMessage.error({ message: `编辑管理员失败：${err}` });
    });
};

// 已经是管理员的人员列表
const managerList = computed(() => {
  return props.memberList?.filter(
    (item) => item.memberType === GroupMemberType.MANAGER
  );
});
// 群主不可变为管理员
const selectableMember = computed(() => {
  return props.memberList?.filter(
    (item) => item.memberType !== GroupMemberType.LEADER
  );
});
</script>

<style lang="less" scoped></style>
