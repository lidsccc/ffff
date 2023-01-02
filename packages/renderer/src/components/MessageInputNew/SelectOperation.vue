<template>
  <div class="h-full flex justify-center items-center gap-8">
    <div class="select-operation" @click="shareTogether">
      <img src="@/assets/multi-share.png" />
      <div>合并转发</div>
    </div>
    <div class="select-operation" @click="shareOnebyOne">
      <img src="@/assets/single-share.png" />
      <div>逐条转发</div>
    </div>
    <div class="select-operation" @click="batchDeleteMessage">
      <img src="@/assets/delete-btn.png" />
      <div>删除</div>
    </div>
    <div class="select-operation" @click="closeSelectMessage">
      <img src="@/assets/close-btn.png" />
      <div>取消</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SelectOperation",
});
</script>

<script lang="ts" setup>
import { useMessageStore } from "@/store/modules/message";
import { ForwardType, MessageOperationStatus } from "@/types/message";

const emits = defineEmits(["on-change-status", "on-forward-message"]);

const messageStore = useMessageStore();

// 合并转发
const shareTogether = () => {
  emits("on-forward-message", { type: ForwardType.Together });
  emits("on-change-status", MessageOperationStatus.Input);
};
// 逐条转发
const shareOnebyOne = () => {
  emits("on-forward-message", { type: ForwardType.OneByOne });
  emits("on-change-status", MessageOperationStatus.Input);
};
// 批量删除
const batchDeleteMessage = () => {
  const selectedMessageList = (
    messageStore.activeRecordItem.messageContentList || []
  ).filter((item: any) => item.checked && item.mid);
  console.log("批量删除消息", selectedMessageList);
  selectedMessageList.forEach((item: any) => {
    window.$imRender
      .delMsgByMsgID(item.mid)
      .then(({ data }: any) => {
        if (data) {
          console.log("删除消息成功", item);
          messageStore.delMessageContent(item.mid);
        } else {
          window.$log.error("delete message failed: ", data);
        }
      })
      .catch((err: any) => {
        window.$log.error("delete message error: ", item, err);
      });
  });
  emits("on-change-status", MessageOperationStatus.Input);
};
// 取消
const closeSelectMessage = () => {
  (messageStore.activeRecordItem.messageContentList || []).forEach(
    (item: any) => {
      if (item.checked) {
        item.checked = false;
      }
    }
  );
  emits("on-change-status", MessageOperationStatus.Input);
};
</script>

<style lang="less" scoped>
.select-operation {
  @apply w-20 p-2 flex flex-col items-center cursor-pointer rounded-md hover:bg-gray-200;
  & > img {
    @apply w-6 mb-4;
  }
}
</style>
