<template>
  <div class="users-group">
    <el-collapse class="px-2" v-model="collapseActive">
      <el-collapse-item title="管理显示日历" name="1">
        <label class="flex justify-between items-center pr-2"
          ><div class="flex items-center">
            <UserAvatar
              :size="26"
              :src="userStore.avatar"
              :name="userStore.firstName"
              :id="userStore.userId"
            >
              <span>{{ userStore.firstName }}</span>
            </UserAvatar>
            <div class="ml-2">我的日历</div>
          </div>
          <el-checkbox :checked="true" :disabled="true" size="large"
        /></label>
        <label
          v-for="item in calendarStore.setMeAuthorityList"
          :key="item"
          class="flex justify-between items-center pr-2"
          ><div class="flex items-center">
            <UserAvatar
              :size="26"
              :src="get(item, 'userVo.avatar')"
              :name="get(item, 'userVo.realName')"
              :id="get(item, 'userVo.userId')"
            >
              <span>{{ get(item, "userVo.realName[0]") }}</span>
            </UserAvatar>
            <div class="ml-2">{{ get(item, "userVo.realName") }}的日历</div>
          </div>
          <el-checkbox
            size="large"
            @change="(checked) => checkboxClick(checked, item.userVo.userId)"
        /></label>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CalendarGroup",
});
</script>
<script lang="ts" setup>
import { ref } from "vue";
import { useCalendarStore } from "@/store/modules/calendar";
import { useUserStore } from "@/store/modules/user";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";

const calendarStore = useCalendarStore();
const userStore = useUserStore();
const collapseActive = ref();
calendarStore.getShareSetListHandle();
const checkboxClick = (checked, val) => {
  calendarStore.setCheckUserList(checked, val);
  calendarStore.fetchEvents();
};
</script>
<style lang="less" scoped>
.users-group {
  margin-top: 20px;
  :deep(.el-collapse) {
    --el-fill-color-blank: #f5f5f5;
    border: none;
    .el-collapse-item__header {
      height: 20px;
      border: none;
    }
    .el-collapse-item__wrap {
      border: none;
      height: 225px;
      overflow-y: auto;
    }
    .el-collapse-item__wrap::-webkit-scrollbar {
      display: none;
    }
    .el-collapse-item__content {
      padding-bottom: 0;
    }
  }
}
</style>
