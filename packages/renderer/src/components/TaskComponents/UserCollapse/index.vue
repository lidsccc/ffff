<template>
  <div class="collapse-wrap">
    <el-collapse v-model="userActive" @change="(val) => (userActive = val)">
      <el-collapse-item name="1">
        <template #title>
          <div class="leading-7 w-16 mr-2 select-none">{{ props.title }}:</div>

          <div class="w-full flex items-center">
            <UserAvatar
              class="mr-5"
              :size="26"
              v-for="item in userListOnShow"
              :key="item.userId"
              :src="get(item, 'user.avatar')"
              :name="get(item, 'user.realName[0]')"
              :id="get(item, 'user.userId')"
            >
              <span>{{ get(item, "user.realName[0]") }}</span>
            </UserAvatar>
            <div v-show="props.userList.length >= props.maxDisplayCount">
              等{{ props.userList.length }}人
            </div>
          </div>
        </template>
        <div class="flex pr-2 flex-wrap">
          <div
            class="h-8 w-8 relative mr-4"
            @click="addUsers"
            v-show="props.editable"
          >
            <img
              src="@/assets/add-user.png"
              alt=""
              class="absolute h-8 top-[-2px] cursor-pointer"
            />
          </div>
          <div
            v-for="item in props.userList"
            :key="item.userId"
            class="flex items-center"
          >
            <div
              v-if="!props.canBeUrged"
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
            <el-tooltip
              v-else
              content="催办"
              popper-class="popper-box"
              placement="top-end"
              :hide-after="100"
            >
              <div
                @click="handelPressToDo(item)"
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
            </el-tooltip>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UserCollapse",
});
</script>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { pressToDo } from "@/api/task";
import { ElMessage } from "element-plus";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";
type Props = {
  userList: any;
  title?: string;
  maxDisplayCount?: number; // 一行展示的最大数量
  canBeUrged?: boolean;
  editable?: boolean; // 是否可编辑
};
const props = withDefaults(defineProps<Props>(), {
  maxDisplayCount: 5,
  title: "参与者",
  canBeUrged: false,
  editable: true,
});
const emits = defineEmits(["on-user-edit", "on-edit"]);

const userActive = ref([]);
// 子任务催办

const handelPressToDo = (user: any) => {
  pressToDo({
    id: user.actionId,
    users: { users: [user.userId] },
  })
    .then(() => {
      ElMessage.success({ message: "催办成功" });
    })
    .catch((err) => {
      ElMessage.error({ message: `催办失败：${err}` });
    });
};
const userListOnShow = computed(() =>
  props.userList.slice(0, props.maxDisplayCount)
);
const addUsers = () => {
  emits("on-user-edit");
};
</script>

<style lang="less" scoped>
.name-block {
  max-width: 44px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
:deep(.el-collapse-item__header) {
  border-bottom: none;
}
:deep(.el-collapse) {
  border-top: none;
}
:deep(.el-collapse-item__content) {
  padding-bottom: 5px;
}
:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}
</style>
