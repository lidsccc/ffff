<template>
  <div
    v-loading="data.loading"
    v-infinite-scroll="loadList"
    class="infinite-list"
    style="overflow: auto"
  >
    <div v-for="item in data.list" :key="item.id">
      <el-checkbox
        v-model="item.checked"
        @change="(checked) => handleSelect(item, checked)"
      >
        <UserAvatar
          class="ml-2"
          :size="24"
          :src="item.iconUrl"
          :name="get(item, 'name[0]')"
          :id="item.id"
        >
          <span>{{ get(item, "name[0]") }}</span>
        </UserAvatar>
        <div class="ml-4">{{ item.name }}</div>
      </el-checkbox>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TopContactList",
});
</script>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useUserStore } from "@/store/modules/user";
import { listTopContact } from "@/api/contacts";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";

interface Props {
  selectedContacts: object[];
}

const props = defineProps<Props>();
const emits = defineEmits(["on-select-change"]);

const userStore = useUserStore();

const data = reactive({
  loading: false,
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10,
  hasMore: true,
});
watch(
  () => props.selectedContacts,
  (selectedContacts) => {
    data.list.forEach((item) => {
      item.checked = selectedContacts.some((contact) => contact.id === item.id);
    });
  }
);
const fetchList = async () => {
  const { list } = data;
  data.loading = true;
  const { items = [], total } = await listTopContact({
    userId: userStore.userId,
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

const handleSelect = (item, checked) => {
  emits("on-select-change", { ...item, checked });
};
</script>

<style lang="less" scoped>
.infinite-list {
  height: 180px;
  :deep(.el-checkbox__label) {
    @apply flex items-center;
  }
}
</style>
