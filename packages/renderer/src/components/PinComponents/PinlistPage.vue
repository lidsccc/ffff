<template>
  <div class="w-full">
    <div
      class="title-wrap w-full pl-4 border-b flex flex-col justify-center"
      :class="isWindows ? 'window-size-header' : ''"
    >
      <div class="w-full text-lg font-medium">
        {{ titleMap[props.type] }}
      </div>
    </div>
    <div
      v-if="props.pinData.pinList?.length"
      class="panel-wrap"
      v-loading="props.pinData.loading"
      v-infinite-scroll="loadMore"
    >
      <div
        v-for="item in props.pinData.pinList"
        :key="item.id"
        class="cursor-pointer relative"
      >
        <PinPanel :pinDetail="item" />
        <div
          class="absolute h-full w-full top-0 left-0"
          @click="showDetailDrawer(item)"
        ></div>
      </div>
    </div>
    <el-empty
      :image-size="200"
      class="h-full"
      v-else
      v-loading="props.pinData.loading"
    />
  </div>
  <PinDetailDrawer
    @on-visible-change="changeDrawerVisible"
    @del-pin="delPin"
    @refresh-pin-list="refreshPinList"
    :visible="pinDetailDrawerVisible"
    :pinId="pinId"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PinlistPage",
});
</script>

<script lang="ts" setup>
import { PinNavListType, PinType } from "@/enums/pin";
import PinDetailDrawer from "@/components/PinComponents/PinDetailDrawer.vue";
import PinPanel from "@/components/PinComponents/PinPanel.vue";
import { ref, computed } from "vue";

type Props = {
  pinData: any;
  type: PinType;
};
const props = defineProps<Props>();
const emits = defineEmits(["load-more", "del-pin", "refresh-pin-list"]);

const isWindows = computed(() => window["$platform"] === "win32");

const loadMore = () => {
  emits("load-more");
};
//当前标题
const titleMap = {
  [PinType.ALL]: PinNavListType.ALL,
  [PinType.REPEATED]: PinNavListType.FINISHED,
  [PinType.UNREPEAT]: PinNavListType.UNFINISHED,
  [PinType.SENT]: PinNavListType.SENT,
};
// 抽屉显隐
const pinDetailDrawerVisible = ref(false);
const changeDrawerVisible = () => {
  pinDetailDrawerVisible.value = false;
};
const pinId = ref("");
const showDetailDrawer = (data: any) => {
  pinDetailDrawerVisible.value = !pinDetailDrawerVisible.value;
  pinId.value = data.id;
};
// 删除pin消息后更新
const delPin = (pinId: string) => {
  emits("del-pin", pinId);
};
// 刷新列表
const refreshPinList = () => {
  emits("refresh-pin-list");
};
</script>

<style lang="less" scoped>
.panel-wrap {
  height: calc(
    100vh - var(--content-header-height) - var(--layout-header-height)
  );
  overflow: auto;
}

.title-wrap {
  box-sizing: border-box;
  height: var(--content-header-height);
}
.window-size-header {
  padding-top: var(--layout-window-size-height);
}
</style>
