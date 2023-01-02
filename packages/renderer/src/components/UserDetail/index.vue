<template>
  <div v-loading="loading" class="px-4">
    <div class="h-12 flex justify-between items-center">
      <ImageCropUpload
        @crop-success="cropSuccess"
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
          <UserAvatar
            :size="200"
            :src="getCacheAvator(detail.iconUrl)"
            shape="square"
            :id="detail.userId"
            ><span class="text-[120px]">{{ detail.realName[0] }}</span>
          </UserAvatar>
          <div class="ml-4 flex flex-col">
            <div>
              <el-button size="small" @click="popoverVisible = false"
                >关闭</el-button
              >
            </div>
            <div v-if="props.canEdit" class="mt-2">
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
          <UserAvatar
            :src="getCacheAvator(detail.iconUrl)"
            :name="detail.realName"
            :id="detail.userId"
            class="cursor-pointer"
            @click="popoverVisible = true"
          />
        </template>
      </el-popover>
      <div class="whitespace-nowrap w-5/6 text-ellipsis overflow-hidden">
        {{ detail.realName }} {{ detail.userId }}
      </div>
    </div>
    <el-divider class="divider" />
    <div
      v-for="item in detailList"
      :key="item.label"
      class="h-10 flex justify-between items-center"
    >
      <div class="font-medium">{{ item.label }}</div>
      <div>{{ item.value }}</div>
    </div>
    <div class="flex justify-center" v-if="canCreateChat">
      <el-button @click="startChat">发起会话</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserDetail",
});
</script>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import ImageCropUpload from "vue-image-crop-upload";
import { ElMessage } from "element-plus";
import { updateAvatar, detailUser } from "@/api/user";
import { getAuthority } from "@/api/contacts";
import { AuthPolicy } from "@/enums/contacts";
import { getCacheAvator } from "@/utils/avatar";
import { dataURLtoBlob } from "@/utils/img";
import UserAvatar from "@/components/UserAvatar/index.vue";

const router = useRouter();

interface Props {
  canEdit?: boolean;
  id?: string;
  hideCreateChatBtn?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
  hideCreateChatBtn: false,
});

const userStore = useUserStore();
const messageStore = useMessageStore();

const isImageCropUploadShow = ref(false);
const popoverVisible = ref(false);
const detail = ref({
  userId: "",
  realName: "",
  iconUrl: "",
  telephone: "",
  email: "",
  departmentName: "",
  superiorName: "",
});
const loading = ref(false);
// 是否有聊天权限 TODO:之后根据产品需求添加相关权限判断
const canCreateChat = ref(false);

const init = async () => {
  if (!props.id) {
    detail.value = {
      userId: userStore.userId,
      realName: userStore.realName,
      iconUrl: userStore.avatar,
      telephone: userStore.telephone,
      email: userStore.email,
      departmentName: userStore.detail.departmentName,
      superiorName: userStore.detail.superiorName,
    };
  } else {
    loading.value = true;
    const userDetail = await detailUser({ id: props.id });
    loading.value = false;
    const {
      id: userId,
      name: realName,
      iconUrl,
      telephone,
      email,
      departmentName,
      superiorName,
    } = userDetail;
    detail.value = {
      userId,
      realName,
      iconUrl,
      telephone,
      email,
      departmentName,
      superiorName,
    };
  }

  if (!props.hideCreateChatBtn && props.id) {
    const { items } = await getAuthority({ id: props.id });
    canCreateChat.value = items.some(
      (i: AuthPolicy) => i === AuthPolicy.M2M_CHAT
    );
  }
};
init();

const detailList = computed(() => [
  { label: "手机号", value: detail.value.telephone },
  { label: "邮箱", value: detail.value.email },
  { label: "部门", value: detail.value.departmentName },
  { label: "职位", value: "暂无" },
  { label: "直属上级", value: detail.value.superiorName },
]);

const cropSuccess = (imageDataUrl: string) => {
  const form = new FormData();
  form.append("file", dataURLtoBlob(imageDataUrl));
  updateAvatar(form)
    .then((iconUrl) => {
      // ElMessage.success({ message: "修改头像成功" });
      userStore.updateAvatar(iconUrl);
      messageStore.updateNameAndAvatarCache(userStore.userId, {
        name: userStore.detail.name,
        avatar: iconUrl,
      });
      init();
    })
    .catch((err) => {
      ElMessage.error({ message: `修改头像失败：${err}` });
    });
};

const startChat = () => {
  router.push({
    path: "/messages/main",
    query: {
      userId: detail.value.userId,
      realName: detail.value.realName,
      iconUrl: detail.value.iconUrl,
      t: Date.now(), // 让每次点击发起会话都能能感知变化
    },
  });
};
</script>

<style lang="less" scoped>
.divider {
  margin: 8px 0;
}
</style>

<style lang="less">
.vue-image-crop-upload {
  .vicp-wrap {
    width: 420px;
  }
}
</style>
