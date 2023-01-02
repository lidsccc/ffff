<template>
  <div class="container">
    <el-drawer
      :modelValue="props.visible"
      @update:model-value="changeVisible"
      :destroy-on-close="true"
      custom-class="history-drawer"
      direction="rtl"
      size="50%"
      modal-class="history-modal"
      :show-close="false"
      :append-to-body="true"
    >
      <template #title>
        <div class="flex justify-between border-b-2 pb-2 text-lg select-none">
          <div class="text-black">
            <span @click="changeVisible(false)" class="mr-2 cursor-pointer"
              >&lt;</span
            >
            <span>历史记录</span>
          </div>
        </div>
      </template>
      <template #default>
        <div
          class="h-full"
          v-infinite-scroll="loadList"
          v-loading="data.loading"
        >
          <div v-if="data.list.length">
            <div
              class="h-20 py-4 px-8 border-b box-border"
              v-for="item in data.list"
              :key="item.id"
            >
              <div class="mb-2">
                <img
                  src="@/assets/history-tag.png"
                  alt=""
                  class="h-5 w-4 inline-block mr-4"
                />
                <span>{{ item.log }}</span>
              </div>
              <div class="date">
                {{ format(item.createTime, "MM月dd日 HH:mm") }}
              </div>
            </div>
          </div>

          <el-empty description="无历史记录" v-else />
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "HistoryDrawer",
});
</script>

<script lang="ts" setup>
import { reactive } from "vue";
import { format } from "date-fns";
import { getTaskLog } from "@/api/task";

type Props = {
  visible: boolean;
  taskId: string;
};
const props = defineProps<Props>();
const emitDrawer = defineEmits<{
  (event: "on-visible-change", data: boolean): void;
}>();
const changeVisible = (visible: boolean) => {
  //详情页隐藏时，清空数据
  if (!visible) {
    data.list = [];
    data.hasMore = true;
    data.loading = false;
    data.pageNum = 1;
    data.total = 0;
  }
  emitDrawer("on-visible-change", visible);
};
//子任务详情列表
const data = reactive({
  loading: false,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  hasMore: true,
});
const fetchList = async () => {
  const { list } = data;
  data.loading = true;
  const { items = [], total } = await getTaskLog({
    taskId: props.taskId,
    pageNum: data.pageNum,
    pageSize: data.pageSize,
  });
  data.list = list.concat(items);
  data.total = total;
  data.hasMore = data.list.length < total;
  data.loading = false;
};
const loadList = () => {
  if (!data.hasMore || data.loading) {
    return;
  }
  fetchList();
  data.pageNum += 1;
};
</script>

<style lang="less" scoped>
.container {
  :deep(.history-modal) {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.08);
    cursor: default;
    box-shadow: none;
    .el-drawer__header {
      padding-right: 0;
      padding-top: 30px;
      margin-bottom: 0;
    }
    .el-drawer__body {
      padding: 0;
    }
    .history-drawer {
      box-shadow: none;
      border-left: 1px solid #e5e7eb;
      .date {
        font-size: 14px;
        color: var(--theme-text-gray);
      }
    }
  }
}
</style>
