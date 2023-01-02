<template>
  <div class="p-4 w-full border-b">
    <div class="flex items-center pin-header mb-2 justify-between">
      <div class="flex items-center">
        <UserAvatar
          :size="24"
          :src="get(pinDetail, 'creatorVo.avatar')"
          :name="get(pinDetail, 'creatorVo.realName[0]')"
          :id="get(pinDetail, 'creatorVo.userId')"
        >
          <span>{{ get(pinDetail, "creatorVo.realName[0]") }}</span>
        </UserAvatar>
        <span class="ml-2">{{ pinDetail?.creatorVo?.realName }}</span>
        <span class="mx-2">{{ format(pinDetail?.createTime, "MM月dd日") }}</span
        ><span class="mr-2"> {{ format(pinDetail?.createTime, "HH:mm") }}</span>
      </div>
      <div
        v-if="pinDetail.selfReceipted === selfReceiptedType.Unreceipt"
        @click="receipt"
      >
        <span class="repeat-button">回执</span>
      </div>
      <div
        v-else
        :class="needReceipt ? 'repeated' : 'detail'"
        v-show="props.statusVisible"
      >
        <span
          >{{ needReceipt ? "已回执" : "查看详情" }}（{{
            pinDetail.receipted
          }}/{{ pinDetail.total }}）</span
        >
      </div>
    </div>
    <div class="pl-8">
      <div class="bg-gray-100 px-2 py-1 w-full rounded pl-4 content-wrap">
        <span class="overflow-ellipsis break-all">
          {{ pinDetail?.content }}</span
        >
      </div>
    </div>
    <div class="w-full pl-4">
      <el-image
        v-for="item in imgList"
        :key="item.id"
        class="w-28 h-14 pl-4 mt-2 inline-block"
        :src="item.attachmentUrl"
        :preview-src-list="imgSrcList"
        fit="cover"
        @click="handleSelectImg(item)"
        :initial-index="initialIndex"
      />
    </div>
    <div
      v-for="item in attachments"
      :key="item.id"
      class="flex items-center pl-4 cursor-pointer"
      @click="handleFileDownload(item)"
    >
      <img
        :src="fileTypeIconMap[matchType(item.name)]"
        alt=""
        class="h-5 mr-2 pl-4 inline-block"
      />
      <span
        class="leading-8 overflow-ellipsis file-name pl-2 overflow-hidden whitespace-nowrap"
      >
        {{ getFileName(item.name) }}
      </span>
      <span>{{ getFileSuffix(item.name) }}</span>
    </div>

    <div class="pl-4 mt-4" v-if="showChoice">
      <el-radio-group v-model="selectedRepeat" class="ml-4 radio-group">
        <el-radio
          class="mb-2"
          :label="item"
          v-for="(item, index) in pinDetail.magicwords"
          :key="item"
          border
          >{{ choiceHead[index] }}{{ item }}</el-radio
        >
      </el-radio-group>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "PinPanel",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { format } from "date-fns";
import { getFileName, getFileSuffix } from "@/components/TaskComponents/util";
import { ElMessage } from "element-plus";
import { selfReceiptedType } from "@/enums/pin";
import { receiptPin } from "@/api/pin";
import { choiceHead } from "@/components/PinComponents/pinConstant";
import { FILE_DOWNLOAD } from "@/../../main/channel";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";
import { useGlobalStore } from "@/store/modules/global";
import { matchType } from "@/components/TaskComponents/util";
import { fileTypeIconMap } from "@/constant/common";

const globalStore = useGlobalStore();
type Props = {
  pinDetail: any;
  isEditable?: boolean;
  statusVisible?: boolean; // 是否展示状态文字
};
const props = withDefaults(defineProps<Props>(), {
  isEditable: false,
  statusVisible: true,
});
// 是否需回执
const needReceipt = computed(() => {
  return props.pinDetail.selfReceipted === selfReceiptedType.Unreceipt;
});
// 图片格式
const imgSuffix = [".png", ".jpg", ".jpeg", ".bmp", ".gif"];

// 图片列表
const imgList = computed(() => {
  return (
    props.pinDetail?.attachments?.filter((item: any) => {
      return imgSuffix.includes(getFileSuffix(item.name));
    }) || []
  );
});
// 图片url列表
const imgSrcList = computed(() => {
  return imgList.value.map((item: any) => {
    return item.attachmentUrl;
  });
});

// 除掉图片的文件列表
const attachments = computed(() => {
  return (
    props.pinDetail?.attachments?.filter((item: any) => {
      return !imgSuffix.includes(getFileSuffix(item.name));
    }) || []
  );
});
//浏览选中的图片
const initialIndex = ref(0);
const handleSelectImg = (item: any) => {
  initialIndex.value = imgSrcList.value.indexOf(item.attachmentUrl);
};
// 选中的回执项
const selectedRepeat = ref(null);
//是否展示选项表
const showChoice = computed(() => {
  return (
    props.pinDetail.magicwords?.length && props.isEditable && needReceipt.value
  );
});
// 回执pin
const emits = defineEmits(["get-current-detail"]);
const receipt = () => {
  if (props.pinDetail.magicwords?.length && !selectedRepeat.value) {
    ElMessage.warning({ message: `请选择回执项` });
  } else {
    const params = {
      id: props.pinDetail.id,
      magicword: selectedRepeat.value,
    };
    receiptPin(params)
      .then((res) => {
        ElMessage.success({ message: "回执Pin消息成功" });
        emits("get-current-detail");
        globalStore.updatePinBadge();
      })
      .catch((err) => {
        ElMessage.warning({ message: `回执Pin消息失败${err}` });
      });
  }
};
// 下载附件
const handleFileDownload = (fileDetail: any) => {
  ipcRenderer.send(FILE_DOWNLOAD, {
    downloadPath: fileDetail.attachmentUrl, // 下载链接
    fileName: fileDetail.name, // 下载文件名
  });
};
</script>

<style lang="less" scoped>
.title-wrap {
  height: 63px;
}
.pin-header {
  color: var(--theme-text-gray);
}

.repeat-button {
  color: var(--theme-color);
  cursor: pointer;
}
.repeated {
  color: #f29400;
}
.detail {
  color: #007aff;
}
.radio-group {
  flex-direction: column;
  align-items: baseline;
}
</style>
