<template>
  <img src="@/assets/share.png" class="w-5 h-5" @click="visible = true" />
  <el-dialog v-model="visible" title="共享" :width="CreateDialogWidth">
    <div
      class="overflow-auto"
      :style="{ maxHeight: `${CreateDialogContentHeight}vh` }"
    >
      <el-table
        :loading="loading"
        :data="tableData"
        style="width: 100%"
        :show-header="false"
      >
        <el-table-column width="210">
          <template #default="scope">
            <div class="flex items-center">
              <UserAvatar
                :size="26"
                :src="get(scope.row, 'sharerVo.avatar')"
                :name="get(scope.row, 'sharerVo.realName')"
                :id="get(scope.row, 'sharerVo.userId')"
              >
                <span>{{ get(scope.row, "sharerVo.realName[0]") }}</span>
              </UserAvatar>
              <span class="ml-2">{{
                get(scope.row, "sharerVo.realName")
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="300">
          <template #default="scope">
            <el-switch
              v-model="scope.row.type"
              active-text="编辑者"
              inactive-text="订阅者"
              :active-value="0"
              :inactive-value="1"
              :loading="switchLoading"
              :before-change="beforeShowChangeManage.bind(this, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column width="70">
          <template #default="scope">
            <img
              src="@/assets/delete-btn.png"
              class="w-5 h-5 cursor-pointer mr-4"
              @click="deleteShareHandler(scope.row.id)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="flex justify-end mr-2 mt-2">
      <el-button type="primary" @click="addVisible = true">添加</el-button>
    </div>
    <CreateAddShareDialog
      :visible="addVisible"
      @on-cancel="addVisible = false"
      @on-confirm="handleEditConfirm"
    />
  </el-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CalendarShare",
});
</script>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CreateAddShareDialog from "@/components/CreateAddShareDialog/index.vue";
import { getShareList, deleteShare, editShare } from "@/api/calendar";
import { useUserStore } from "@/store/modules/user";
import { useGlobalStore } from "@/store/modules/global";
import {
  CreateDialogWidth,
  CreateDialogContentHeight,
} from "@/constant/common";
import UserAvatar from "@/components/UserAvatar/index.vue";
import { get } from "lodash-es";

const userStore = useUserStore();
const globalStore = useGlobalStore();
const visible = ref(false);
const loading = ref(false);
const tableData = ref();
const addVisible = ref(false);
const getShareListHandler = () => {
  const params = { pageSize: 10000 };
  loading.value = true;
  getShareList(params)
    .then((data) => {
      tableData.value = data.items;
      //设置不能添加共享的人员
      const unSharelist = data.items.map((item) => {
        return { id: item.sharerVo.userId };
      });
      unSharelist.push({ id: userStore.userId });
      globalStore.addSelectDisableList(unSharelist);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      loading.value = false;
    });
};
watch(
  () => visible.value,
  (n, o) => {
    if (n === true) {
      getShareListHandler();
    } else {
      globalStore.clearSelectDisableList();
    }
  }
);
const handleEditConfirm = () => {
  getShareListHandler();
  addVisible.value = false;
};
const switchLoading = ref(false);
const beforeShowChangeManage = (item) => {
  switchLoading.value = true;
  const params = { id: item.id, type: item.type === 1 ? 0 : 1 };
  return new Promise((resolve, reject) => {
    editShare(params)
      .then(() => {
        switchLoading.value = false;
        ElMessage.success({ message: "修改成功" });
        resolve(true);
      })
      .catch((err) => {
        switchLoading.value = false;
        ElMessage.error({ message: `修改失败：${err}` });
        reject(false);
      });
  });
};
const deleteShareHandler = (id) => {
  ElMessageBox.confirm("确定要删除吗？").then(() => {
    deleteShare({ id: id })
      .then(() => {
        ElMessage.success({ message: "删除成功" });
        getShareListHandler();
      })
      .catch((err) => {
        ElMessage.error({ message: `删除失败：${err}` });
      });
  });
};
</script>
