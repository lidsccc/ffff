<template>
  <el-dialog
    :modelValue="props.visible"
    @update:modelValue="changeVisible"
    title="群公告"
    width="400px"
    destroy-on-close
  >
    <div class="flex">
      <UserAvatar :size="56" :src="props.groupDetail.iconUrl" />
      <div class="pl-4 flex flex-col justify-center">
        <div class="group-name">{{ props.groupDetail.groupName }}</div>
        <div class="time">
          {{ format(props.groupDetail.createTime, "yyyy-MM-dd") }}
        </div>
      </div>
    </div>
    <el-divider class="divider" />
    <div class="announcement">
      <div v-if="!data.isEditAnnouncement">
        {{ props.groupDetail.announcement }}
      </div>
      <el-input v-else v-model="data.announcement" :rows="5" type="textarea" />
    </div>
    <div v-if="!props.hasManageRights" class="info-msg">
      仅群主和管理员可编辑
    </div>
    <div v-else class="mt-5 flex justify-center">
      <el-button
        v-if="!data.isEditAnnouncement"
        @click="() => (data.isEditAnnouncement = true)"
        >编辑</el-button
      >
      <div v-if="data.isEditAnnouncement">
        <el-button @click="() => (data.isEditAnnouncement = false)"
          >取消</el-button
        >
        <el-button type="primary" @click="onConfirm">确定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EditGroupDialog",
});
</script>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { updateGroup } from "@/api/message";
import { useUserStore } from "@/store/modules/user";
import { ElMessage } from "element-plus";
import { format } from "date-fns";
import UserAvatar from "@/components/UserAvatar/index.vue";

const userStore = useUserStore();

interface Props {
  hasManageRights: boolean;
  visible: boolean;
  groupDetail: object;
}
const props = defineProps<Props>();
const emits = defineEmits(["on-change-visible", "on-confirm"]);

const data = reactive({
  isEditAnnouncement: false,
  announcement: props.groupDetail.announcement,
});
watch(
  () => props.groupDetail.announcement,
  () => {
    data.announcement = props.groupDetail.announcement;
  }
);

const changeVisible = (visible) => {
  emits("on-change-visible", visible);
};

const onConfirm = () => {
  updateGroup({
    groupId: props.groupDetail.groupId,
    userId: userStore.userId,
    announcement: data.announcement,
  })
    .then(() => {
      data.isEditAnnouncement = false;
      ElMessage.success({ message: "更新群公告成功" });
      emits("on-confirm");
      changeVisible(false);
    })
    .catch((err) => {
      ElMessage.error({ message: `更新群公告息失败：${err}` });
    });
};
</script>

<style lang="less" scoped>
.group-name {
  font-size: 16px;
  line-height: 24px;
  color: #000;
}
.time {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}
.divider {
  margin: 16px 0;
}
.announcement {
  font-size: 14px;
  color: #333;
  line-height: 24px;
  white-space: pre;
}
.info-msg {
  margin-top: 20px;
  font-size: 12px;
  color: #999;
  line-height: 18px;
}
</style>
