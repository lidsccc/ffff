<template>
  <div>
    <el-drawer
      :modelValue="props.visible"
      @update:model-value="changeVisible"
      modal-class="drawer-modal"
      :show-close="false"
      :destroy-on-close="true"
      size="65%"
    >
      <template #title>
        <div class="flex justify-between border-b-2 pb-2 text-lg">
          <div class="text-black flex items-center">
            <el-icon class="cursor-pointer mr-2" @click="changeVisible(false)"
              ><arrow-left-bold
            /></el-icon>
            <span>通知详情</span>
          </div>
          <div v-show="isCreator">
            <img
              class="w-5 h-5 cursor-pointer mr-5"
              src="@/assets/pin-delete.png"
              alt=""
              @click="deleteDialogVisible = true"
            />
          </div>
        </div>
      </template>
      <template #default v-if="panelVisible">
        <PinPanel
          :pinDetail="pinDetail"
          :isEditable="true"
          :statusVisible="false"
          @get-current-detail="getCurrentDetail"
        />
        <!-- 已回执或无需回执时展示回执详情 -->
        <div
          class="pl-6 pt-4 relative"
          v-if="receipteType !== selfReceiptedType.Unreceipt"
        >
          <div
            class="absolute top-7 right-4 cursor-pointer z-10"
            @click="downloadReceiptStatus"
          >
            <el-icon><Download /></el-icon>
          </div>
          <el-tabs
            class="demo-tabs"
            v-model="activeName"
            @tab-click="handleUsers"
          >
            <el-tab-pane
              label="已回执"
              name="已回执"
              v-if="!pinDetail.magicwords?.length"
            >
              <PinUserList :userList="selectUserList" />
            </el-tab-pane>
            <!-- 此处为避免panel名重复，为回执选项加上后缀1 -->
            <el-tab-pane
              v-for="(item, index) in pinDetail.magicwords"
              :key="item"
              :label="`${choiceHead[index]}` + item"
              :name="item + '1'"
              v-else
            >
              <PinUserList :userList="selectUserList" />
            </el-tab-pane>

            <el-tab-pane label="未回执" name="未回执">
              <PinUserList :userList="selectUserList" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </el-drawer>
  </div>
  <el-dialog v-model="deleteDialogVisible" width="300px" top="30vh">
    <div class="flex flex-col justify-center items-center">
      <img src="@/assets/confirm.png" class="w-24" />
      <div class="mt-4 flex flex-col justify-center items-center">
        <div>确认删除当前Pin消息？</div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDelete(props.pinId)"
          >确定</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { selfReceiptedType } from "@/enums/pin";
import type { TabsPaneContext } from "element-plus";

export default defineComponent({
  name: "PinDetailDrawer",
});
</script>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { getPinDetail, delPin, getPinStatus } from "@/api/pin";
import PinPanel from "@/components/PinComponents/PinPanel.vue";
import { useUserStore } from "@/store/modules/user";
import PinUserList from "@/components/PinComponents/PinUserList.vue";
import { ElMessage } from "element-plus";
import { choiceHead } from "@/components/PinComponents/pinConstant";
import { ArrowLeftBold, Download } from "@element-plus/icons-vue";
import { FILE_DOWNLOAD } from "@/../../main/channel";
const userStore = useUserStore();
const userId = userStore.userId;
type Props = {
  visible: boolean;
  pinId: string;
};
const props = defineProps<Props>();
const emitDrawer = defineEmits([
  "on-visible-change",
  "del-pin",
  "refresh-pin-list",
]);
const changeVisible = (visible: boolean) => {
  emitDrawer("on-visible-change", visible);
};
const pinDetail = ref();
const panelVisible = ref(false);
const receipteType = ref(0);
// 获得消息详情
const activeName = ref("");
const userList = ref([]);
const fetchDetail = () => {
  getPinDetail({ id: props.pinId }).then((res) => {
    panelVisible.value = true;
    pinDetail.value = res;
    activeName.value = res.magicwords?.length
      ? res.magicwords[0] + "1"
      : "已回执";
    userList.value = res.users;
    receipteType.value = res.selfReceipted;

    handleSelectList(activeName.value);
  });
};
// 是否是创建者
const isCreator = computed(() => {
  return pinDetail.value?.creator === userId;
});

watch(
  () => props.visible,
  () => {
    if (props.pinId && props.visible) {
      panelVisible.value = false;
      fetchDetail();
    }
  }
);

// 删除pin消息
const deleteDialogVisible = ref(false);

const confirmDelete = () => {
  delPin({ id: props.pinId })
    .then((res) => {
      ElMessage.success({ message: "删除Pin消息成功" });
      changeVisible(false);
      emitDrawer("del-pin", props.pinId);
      deleteDialogVisible.value = false;
    })
    .catch((err) => {
      ElMessage.warning({ message: `删除Pin消息失败${err}` });
    });
};
// 回执人员展示
const selectUserList = ref([]);
const handleSelectList = (tabName: string) => {
  if (tabName === "已回执") {
    selectUserList.value = userList.value.filter((item: any) => {
      return item.isReceipted === selfReceiptedType.Receipted;
    });
  } else if (tabName === "未回执") {
    selectUserList.value = userList.value.filter((item: any) => {
      return item.isReceipted === selfReceiptedType.Unreceipt;
    });
  } else {
    selectUserList.value = userList.value.filter((item: any) => {
      return item.magicwords
        ? item.magicwords[0] === tabName.substring(0, tabName.length - 1) // 去除回执项后加的标识符1,并筛选
        : false;
    });
  }
};
const handleUsers = (tab: TabsPaneContext) => {
  handleSelectList(tab.paneName);
};

// 子任务状态改变后，更新数据
const getCurrentDetail = () => {
  fetchDetail();
  emitDrawer("refresh-pin-list");
};

// 导出回执情况表格
const downloadReceiptStatus = () => {
  getPinStatus({ id: props.pinId }).then((url) => {
    window.ipcRenderer.send(FILE_DOWNLOAD, {
      downloadPath: url, // 下载链接
      fileName: `回执详情${props.pinId}.xlsx`, // 下载文件名
    });
  });
};
</script>

<style lang="less" scoped>
:deep(.drawer-modal) {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.08);
  cursor: default;
  box-shadow: none;
  .el-drawer__header {
    padding-right: 0;
    margin-bottom: 0;
    padding-top: 23px;
  }
  .el-drawer__body {
    padding: 0;
  }
  .task-drawer {
    box-shadow: none;
    border-left: 1px solid #e5e7eb;
  }

  .el-tabs__item {
    max-width: 150px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
  }
}
</style>
