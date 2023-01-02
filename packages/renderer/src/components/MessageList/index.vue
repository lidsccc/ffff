<template>
  <el-empty v-if="props.list.length === 0" description="暂无数据" />
  <div v-else>
    <div v-for="item in props.list" :key="item.mid">
      <div class="flex">
        <div class="w-12">
          <UserAvatar
            :size="36"
            :src="getCacheAvator(getAvatar(item))"
            :name="getName(item)"
            :id="item.from"
            class="mr-4"
          />
        </div>
        <div class="flex-auto">
          <div class="flex justify-between items-center mb-1">
            <div>{{ getName(item) }}{{ item.from }}</div>
            <div class="pr-1">
              {{
                dateFns.format(
                  new Date(item.sendTime * 1000),
                  "yyyy-MM-dd HH:mm:ss"
                )
              }}
            </div>
          </div>
          <div class="text-black">
            <TextMessage
              :showBubble="false"
              v-if="
                item.msgType === MessageContentType.Text ||
                isQuotedMessage(item)
              "
              :detail="item"
            />
            <ImageMessage
              :showBubble="false"
              v-else-if="item.msgType === MessageContentType.Image"
              :detail="item"
            />
            <MergerMessage
              v-else-if="item.msgType === MessageContentType.Merger"
              :detail="item"
            />
            <AudioMessage
              :showBubble="false"
              v-else-if="item.msgType === MessageContentType.Audio"
              :detail="item"
            />
            <VideoMessage
              :showBubble="false"
              v-else-if="item.msgType === MessageContentType.Video"
              :detail="item"
            />
            <LocationMessage
              :showBubble="false"
              v-else-if="item.msgType === MessageContentType.Location"
              :detail="item"
            />
            <BusinessCardMessage
              :showBubble="false"
              v-else-if="isBusinessCardMessage(item)"
              :detail="item"
            />
            <FileMessage
              :showBubble="false"
              v-else-if="item.msgType === MessageContentType.File"
              :detail="item"
            />
            <ArticleMessage
              :showBubble="false"
              v-else-if="item.msgType === MessageContentType.Article"
              :detail="item"
            />
            <TaskMessage
              :showBubble="false"
              v-else-if="isTaskMessage(item)"
              :detail="item"
            />
            <AgendaMessage
              :showBubble="false"
              v-else-if="isAgendaMessage(item)"
              :detail="item"
            />
            <UnknowMessage v-else :detail="item" />
          </div>
        </div>
      </div>
      <el-divider />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MessageHistoryList",
});
</script>

<script lang="ts" setup>
import { MessageContentType } from "@/types/message";
import * as dateFns from "date-fns";
// import { get } from "lodash-es";
import { useMessageStore } from "@/store/modules/message";
import { useUserStore } from "@/store/modules/user";
import {
  isQuotedMessage,
  isBusinessCardMessage,
  isTaskMessage,
  isAgendaMessage,
} from "@/utils/message";
import TextMessage from "@/components/MessageType/TextMessage.vue";
import ImageMessage from "@/components/MessageType/ImageMessage.vue";
import MergerMessage from "@/components/MessageType/MergerMessage.vue";
import AudioMessage from "@/components/MessageType/AudioMessage.vue";
import VideoMessage from "@/components/MessageType/VideoMessage.vue";
import LocationMessage from "@/components/MessageType/LocationMessage.vue";
import BusinessCardMessage from "@/components/MessageType/BusinessCardMessage.vue";
import FileMessage from "@/components/MessageType/FileMessage.vue";
import ArticleMessage from "../MessageType/ArticleMessage.vue";
import TaskMessage from "@/components/MessageType/TaskMessage.vue";
import AgendaMessage from "@/components/MessageType/AgendaMessage.vue";
import UnknowMessage from "@/components/MessageType/UnknowMessage.vue";
import { getCacheAvator } from "@/utils/avatar";
import UserAvatar from "@/components/UserAvatar/index.vue";

const userStore = useUserStore();
const messageStore = useMessageStore();

interface Props {
  list: any[];
}

const props = defineProps<Props>();

const isFromOther = (message: any) => message.from !== userStore.userId;
const getAvatar = (message: any) => {
  if (!isFromOther(message)) {
    return userStore.avatar;
  }
  return message.avatar || messageStore.activeRecordItem.conversationAvatar;
};
// const getFirstName = (message: any) => {
//   if (isFromOther(message)) {
//     return (
//       get(message, "name[0]") ||
//       get(messageStore, "activeRecordItem.conversationName[0]") ||
//       ""
//     );
//   }
//   return userStore.firstName;
// };
const getName = (message: any) => {
  if (!isFromOther(message)) {
    return userStore.realName;
  }
  return message.name || messageStore.activeRecordItem.conversationName;
};
</script>

<style lang="less" scoped>
.text-gray {
  color: var(--theme-text-gray);
}
</style>
