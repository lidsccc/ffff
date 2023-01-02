<template>
  <div class="search-input">
    <el-autocomplete
      class="py-2 w-full"
      placeholder="请输入搜索内容"
      :debounce="500"
      popper-class="calendar-search-popper"
      :prefix-icon="Search"
      v-model="data.keyword"
      :fetch-suggestions="querySearchAsync"
      value-key="name"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AutoCompleteSearch",
});
</script>

<script lang="ts" setup>
import { reactive } from "vue";
import { Search } from "@element-plus/icons-vue";
import { listDepartmentMember } from "@/api/contacts";
const emits = defineEmits(["on-select"]);

const data = reactive({
  keyword: "",
  detailData: {},
  loading: false,
});
const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  const params = {
    recurse: 1,
    isDel: 0,
  };
  if (/^[\u4E00-\u9FA5]+$/.test(queryString)) {
    // 全是中文时按姓名搜索
    params.name = queryString;
    listDepartmentMember(params).then(({ items }) => {
      cb(items);
    });
  } else if (/^1\d{10}$/.test(queryString)) {
    // 十一位数字时按手机号搜索
    params.telephone = queryString;
    listDepartmentMember(params).then(({ items }) => {
      cb(items);
    });
  } else {
    // 其他如字母+数字时，同时搜索name和拼音
    Promise.all([
      listDepartmentMember({ name: queryString, ...params }),
      listDepartmentMember({ userSpell: queryString, ...params }),
    ]).then((val) => {
      cb([...val[0].items, ...val[1].items]);
    });
  }
};
const handleSelect = (item) => {
  emits("on-select", item);
  data.keyword = "";
};
</script>
<style lang="less" scoped>
.search-input {
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6;
  }
}
</style>
