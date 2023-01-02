<template>
  <div class="w-full flex flex-col items-center">
    <div class="h-12 w-full bg-primary"></div>
    <el-avatar
      :size="56"
      :src="props.data.iconUrl || Default_Group_Avatar"
      class="-mt-7"
    />
    <div class="title text-base font-medium truncate">
      {{ props.data.groupName }}
    </div>
    <img :src="data.url" class="w-44" />
    <!-- <div class="text-base font-medium mb-1">加入该群聊</div> -->
    <!-- <div class="text-gray font-medium">
      {{ expirationText }}
    </div> -->
    <!-- <el-popover
      placement="top"
      :width="260"
      trigger="hover"
    > -->
    <div class="flex flex-col justify-center ml-8">
      <el-radio v-model="data.expirationRadio" :label="1"
        >7天内（{{ data.expirationDay }}前）有效</el-radio
      >
      <el-radio v-model="data.expirationRadio" :label="2"
        >1年内（{{ data.expirationYear }}前）有效</el-radio
      >
      <el-radio v-model="data.expirationRadio" :label="3"
        >永久（仅对自己部分的二维码有效）有效</el-radio
      >
    </div>
    <!-- <template #reference>
        <div
          class="text-lg text-primary font-medium my-2 mb-4 px-2 rounded cursor-pointer"
        >
          更改有效期
        </div>
      </template>
    </el-popover> -->

    <div class="flex items-center mt-1">
      <el-button @click="share">分享</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </div>
  <ContactSelect
    :visible="contactSelectVisible"
    :showGroup="true"
    :appendToBody="true"
    @on-visible-change="handleVisibleChange"
    @on-confirm="onConfirm"
    @on-cancel="onCancel"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "QrCode",
});
</script>

<script lang="ts" setup>
import { reactive, watchEffect, ref } from "vue";
import { addDays, addYears, format } from "date-fns";
import QRCode from "qrcode";
import { Default_Group_Avatar } from "@/constant/base64";
import { FILE_DOWNLOAD, WRITE_FILE } from "@/../../main/channel";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  data: object;
}

const props = defineProps<Props>();

const data = reactive({
  url: "",
  expirationRadio: 2,
  expirationDay: format(addDays(new Date(), 7), "yyyy-MM-dd"), // 7天内有效
  expirationYear: format(addYears(new Date(), 1), "yyyy-MM-dd"), // 1年内有效
  expirationDayTime: +addDays(new Date(), 7),
  expirationYearTime: +addYears(new Date(), 1),
});

// const expirationText = computed(() => {
//   if (data.expirationRadio === 1) {
//     return `该二维码7天内（${data.expirationDay}日前）有效`;
//   } else if (data.expirationRadio === 2) {
//     return `该二维码1年内（${data.expirationYear}日前）有效`;
//   } else {
//     return `该二维码永久（仅对自己部分的二维码有效）有效`;
//   }
// });

watchEffect(() => {
  const qrInfo = {
    group: {
      groupId: props.data.groupId,
      groupLeader: props.data.groupLeader,
      groupLeaderId: props.data.groupLeaderId,
      groupName: props.data.groupName,
      iconUrl: props.data.iconUrl,
      isOfficial: props.data.isOfficial,
      memberType: props.data.memberType,
      count: props.data.count,
      announcement: props.data.announcement || "",
      createTime: props.data.createTime,
    },
    expirationTime:
      data.expirationRadio === 3
        ? null
        : data.expirationRadio === 1
        ? data.expirationDayTime
        : data.expirationYearTime,
  };
  QRCode.toDataURL(JSON.stringify(qrInfo)).then((url) => {
    data.url = url;
  });
});

const contactSelectVisible = ref(false);
const handleVisibleChange = (visible: boolean) => {
  contactSelectVisible.value = visible;
};
const onCancel = () => {
  contactSelectVisible.value = false;
};
const onConfirm = async (selectedList: any[]) => {
  const savedPath = await window.ipcRenderer.invoke(WRITE_FILE, data.url);
  console.log("群二维码保存路径", savedPath);

  if (!savedPath) {
    ElMessage.error("群二维码保存失败");
    return;
  }

  console.log(selectedList);
  for (let i = 0; i < selectedList.length; i++) {
    const selected = selectedList[i];
    const param = {
      api: "IM_buildImgMsg",
      content: { imagePath: savedPath },
      receiver: null,
      groupID: null,
      callback: ([code, desc, jsonParams]: any) => {
        if (code !== 0) {
          window.$log.error("消息发送失败", [code, desc, jsonParams]);
        }
        if (!jsonParams) {
          return;
        }
        try {
          const message = JSON.parse(jsonParams);
          if (param.receiver !== userStore.userId) {
            console.log("新增发送消息", message);
            messageStore.addPushMessageContent(message);
          }
        } catch (err) {
          window.$log.error("分享图片发送失败:", [code, desc, jsonParams]);
        }
      },
    };
    if (selected.isGroup) {
      param.groupID = selected.id;
    } else {
      param.receiver = selected.id;
    }
    window.$imRender.sendMessage(param);
  }
  contactSelectVisible.value = false;
};
const share = async () => {
  contactSelectVisible.value = true;
};
const save = () => {
  window.ipcRenderer.send(FILE_DOWNLOAD, {
    downloadPath: data.url,
    fileName: `群二维码_${Date.now()}.jpg`,
  });
};
</script>

<style lang="less" scoped>
.title {
  max-width: 240px;
}
</style>
