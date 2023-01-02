<template>
  <div class="flex flex-row h-full">
    <div class="flex flex-col h-full">
      <div class="bg-white">
        <CreatePin @on-pinlist-refresh="getLatestPinList" />
      </div>
      <PinNavlist @handle-pin-type="handlePinType" />
    </div>
    <PinlistPage
      :type="type"
      :pinData="pinData"
      @load-more="loadMore"
      @del-pin="delPin"
      @refresh-pin-list="refreshPinList"
    />
  </div>
</template>
<script lang="ts" setup>
import PinNavlist from "@/components/PinComponents/PinNavlist.vue";
import CreatePin from "@/components/PinComponents/CreatePin.vue";
import PinlistPage from "@/components/PinComponents/PinlistPage.vue";
import { ElMessage } from "element-plus";
import { PinListParams } from "@/components/PinComponents/type";
import { getPinlList } from "@/api/pin";
import { PinType } from "@/enums/pin";

import { ref, watch, reactive } from "vue";
const type = ref(PinType.ALL);
// 切换pin类别时获得当前类别
const handlePinType = (pinType: PinType) => {
  type.value = pinType;
};
// 创建pin后刷新列表
const getLatestPinList = () => {
  refreshPinList();
};

const params: PinListParams = {
  creator: "",
  pageNum: 1,
  pageSize: 10,
};
const pinData = reactive({
  total: 0,
  loading: false,
  hasMore: true,
  pinList: [],
});
// 根据type获得列表数据，默认全部
const fetchPinList = (pinType: PinType = PinType.ALL) => {
  pinData.loading = true;
  params.type = pinType;
  getPinlList(params)
    .then((res) => {
      pinData.total = res.total;
      pinData.pinList = pinData.pinList.concat(res.items);
    })
    .catch((err) => {
      ElMessage.warning({ message: `获取列表失败${err}` });
    })
    .finally(() => {
      pinData.loading = false;
      pinData.hasMore = pinData.pinList.length < pinData.total;
    });
};
// 重新获得列表数据
const refreshPinList = () => {
  pinData.hasMore = true;
  pinData.pinList = [];
  params.pageNum = 1;
  fetchPinList(type.value);
};
// 加载下一页
const loadMore = () => {
  params.pageNum++;
  if (!pinData.hasMore || pinData.loading) {
    return;
  }
  fetchPinList(type.value);
};
fetchPinList();
// PIN类型变化时请求数据
watch(
  () => type.value,
  () => {
    refreshPinList();
  }
);

// 删除Pin消息
const delPin = (pinId: string) => {
  pinData.pinList = pinData.pinList.filter((item: any) => item.id != pinId);
};
</script>

<style lang="less" scoped></style>
