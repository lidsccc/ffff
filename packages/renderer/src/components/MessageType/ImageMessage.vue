<template>
  <div
    v-loading="loading"
    @click="handleDownloadImg"
    :class="
      !props.showBubble
        ? 'container'
        : fromOther
        ? 'bubble bubble-left'
        : 'bubble bubble-right'
    "
  >
    <el-image
      style="background: #f5f7fa; width: 220px; height: 220px"
      :src="thumbPath"
      :preview-src-list="imgDownloadInfo.previewSrcList"
      fit="contain"
    />
    <el-progress
      v-if="imgDownloadInfo.isProgressShow"
      class="progress"
      type="circle"
      :stroke-width="3"
      :width="20"
      :show-text="false"
      :percentage="imgDownloadInfo.percentage"
    />
  </div>
  <MessageProgress :mid="props.detail.mid" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ImageMessage",
});
</script>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { Message } from "@/types/message";
import { useUserStore } from "@/store/modules/user";
import { useMessageStore } from "@/store/modules/message";
import MessageProgress from "@/components/MessageProgress/index.vue";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  detail: Message;
  showBubble?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showBubble: true });

// window.$log.error("图片消息", props.detail);

const fromOther = computed(() => {
  return props.detail.from !== userStore.userId;
});

const messageContent = computed(() => {
  try {
    return JSON.parse(props.detail.content);
  } catch {
    return {};
  }
});

const loading = ref(true);
const thumbPath = ref("");
const imgPath = messageContent.value.thumbPath || messageContent.value.path;
if (imgPath) {
  thumbPath.value = `local:///${imgPath}`;
  loading.value = false;
}

const downloadImg = () => {
  let isOriginalFile = false;
  if (!messageContent.value.thumbFid) {
    // window.$log.error("[ImageMessage]:图片消息没有缩略图", props.detail);
    // 没有缩略图就下载原图
    isOriginalFile = true;
  }
  window.$imRender.downloadFile({
    messageId: props.detail.mid,
    isOriginalFile,
    callback: ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        // 下载成功
        messageStore.updateMessageTransmissionPercentage(props.detail.mid, 100);
        try {
          const { savedPath } = JSON.parse(jsonParams);
          thumbPath.value = `local:///${savedPath}`;
          loading.value = false;
          // console.log("图片消息 thumbPath ", thumbPath.value);
        } catch (err: any) {
          window.$log.error("下载图片成功结果解析失败", err);
          return;
        }
      } else if (code === 1) {
        // 下载进度不做处理
        messageStore.updateMessageTransmissionPercentage(
          props.detail.mid,
          Math.floor(desc * 100)
        );
      } else {
        // 下载失败
        window.$log.error(`下载缩略图失败：${desc}`);
        loading.value = false;
      }
    },
  });
};

downloadImg();

const imgDownloadInfo = reactive<{
  isProgressShow: boolean;
  percentage: number;
  previewSrcList: string[];
}>({
  isProgressShow: false,
  percentage: 0,
  previewSrcList: [],
});
const handleDownloadImg = () => {
  if (imgDownloadInfo.percentage >= 100) {
    return;
  }
  imgDownloadInfo.isProgressShow = true;
  window.$imRender.downloadFile({
    messageId: props.detail.mid,
    isOriginalFile: true,
    callback: ([code, desc, jsonParams]: any) => {
      if (code === 0) {
        // 原图下载成功
        imgDownloadInfo.percentage = 100;
        try {
          const { savedPath } = JSON.parse(jsonParams);
          imgDownloadInfo.previewSrcList = [`local:///${savedPath}`];
        } catch (err) {
          window.$log.error("下载原图结果解析出错：", err);
        }
        setTimeout(() => {
          imgDownloadInfo.isProgressShow = false;
        }, 300);
      } else if (code === 1) {
        imgDownloadInfo.percentage = Math.ceil(Number(desc) * 100);
      } else {
        ElMessage.error(`图片下载失败：${desc}`);
      }
    },
  });
};
</script>

<style lang="less" scoped>
.container {
  position: relative;
}
.bubble {
  max-width: 250px;
  max-height: 250px;
  position: relative;
  cursor: pointer;
  font-size: 0;
}

.bubble-left {
  border-radius: 3px 10px 10px 12px;
}
.bubble-right {
  border-radius: 10px 3px 12px 10px;
}

.progress {
  position: absolute;
  left: calc(50% - 10px);
  top: calc(50% - 10px);
}
</style>
