<template>
  <div class="pr-4" v-if="props.userList.length">
    <div class="w-full flex flex-wrap">
      <div
        v-for="item in hasMore && isShowList ? props.userList : onShowList"
        :key="item.userId"
        class="bg-[#f4f8ff] cursor-pointer w-18 px-2 py-1 rounded-full items-center flex mb-2 mr-4"
      >
        <UserAvatar
          :size="20"
          :src="get(item, 'user.avatar')"
          :name="get(item, 'user.realName[0]')"
          :id="get(item, 'user.userId')"
        >
          <span>{{ get(item, "user.realName[0]") }}</span>
        </UserAvatar>
        <div class="ml-1 text-sm name-block">
          {{ get(item, "user.realName") }}
        </div>
      </div>
    </div>
    <div v-if="hasMore">
      <div
        class="check-all-button text-sm cursor-pointer"
        @click="handleShowList"
      >
        {{ isShowList ? "收起" : "查看全部>>" }}
      </div>
    </div>
  </div>
  <el-empty v-else description="暂无数据" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "PinPanel",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";

type Props = {
  userList: any[];
};
const props = defineProps<Props>();
// 默认最大展示数量
const MAX_USER_COUNT = 12;
const onShowList = computed(() => {
  return props.userList.slice(
    0,
    props.userList.length > MAX_USER_COUNT
      ? MAX_USER_COUNT
      : props.userList.length
  );
});
// 是否有更多需要展示
const hasMore = props.userList.length > MAX_USER_COUNT;
const isShowList = ref(false);
const handleShowList = () => {
  isShowList.value = !isShowList.value;
};
</script>

<style lang="less" scoped>
.name-block {
  max-width: 44px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.check-all-button {
  font-weight: 400;
  color: #00b0bb;
}
</style>
