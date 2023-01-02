<template>
  <div class="flex cursor-pointer file-wrap">
    <img
      :src="fileTypeIconMap[matchType(props.attachments.name)]"
      alt=""
      class="h-9"
      v-if="!props.attachments.loading"
    />
    <img src="@/assets/loading.gif" alt="" class="h-9" v-else />
    <div class="mr-[15px] ml-2 w-48">
      <div class="file-name text-sm mb-[5px]">
        {{ props.attachments.name }}
      </div>
      <!-- TODO:上传人接口待更新，目前写死 -->
      <div class="text-xs text-gray-400 flex leading-5">
        <div>上传人:</div>
        <div class="w-[45px] text-ellipsis overflow-hidden whitespace-nowrap">
          {{ "张三三三11请问服务器分 " }}
        </div>
        <div>
          <span class="mx-2">{{
            format(props.attachments.createTime || Date.now(), "yyyy-MM-dd")
          }}</span>
        </div>
      </div>
    </div>
    <el-dropdown @command="handleCommand" v-if="!props.attachments.loading">
      <el-icon class="pt-[18px]"><MoreFilled /></el-icon>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :command="FileOperation.Download">
            <el-icon><Download /></el-icon>
            <span>下载</span></el-dropdown-item
          >
          <el-dropdown-item
            :command="FileOperation.Delete"
            v-if="props.deleteAble"
          >
            <el-icon color="red"><Delete /></el-icon>
            <span class="text-red-500">删除</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DownloadFile",
});
</script>

<script lang="ts" setup>
import { Download, MoreFilled, Delete } from "@element-plus/icons-vue";
import { matchType } from "@/components/TaskComponents/util";
import { FileType } from "@/enums/fileType";
import PPTIcon from "@/assets/ppt.png";
import WordIcon from "@/assets/word.png";
import ExcelIcon from "@/assets/excel.png";
import MusicIcon from "@/assets/music.png";
import UnknowIcon from "@/assets/unknow.png";
import PdfIcon from "@/assets/pdf.png";
import TxtIcon from "@/assets/txt.png";
import { format } from "date-fns";
import { FileOperation } from "@/enums/fileOperation";
type Props = {
  attachments: any;
  deleteAble?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  deleteAble: true,
});
const emits = defineEmits(["on-download", "on-delete"]);

// 下载文件
const handleDownload = () => {
  emits("on-download", props.attachments);
};
// 删除文件
const deleteFile = () => {
  emits("on-delete", props.attachments);
};
const fileTypeIconMap = {
  [FileType.PPT]: PPTIcon,
  [FileType.PDF]: PdfIcon,
  [FileType.WORD]: WordIcon,
  [FileType.EXCEL]: ExcelIcon,
  [FileType.MUSIC]: MusicIcon,
  [FileType.TXT]: TxtIcon,
  [FileType.UNKOWN]: UnknowIcon,
};
const handleCommand = (operation: FileOperation) => {
  if (operation === FileOperation.Download) {
    handleDownload();
  } else {
    deleteFile();
  }
};
</script>

<style lang="less" scoped>
.file-wrap {
  width: 270px;
  box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.07);
  transition: 0.3s;
  padding: 8px 8px 4px 8px;
}
.file-wrap:hover {
  box-shadow: 0 2px 20px 0 rgba(0, 0, 0, 0.17);
}
.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  line-height: 15px;
  white-space: nowrap;
  // display: -webkit-box;
  // -webkit-box-orient: vertical;
  // -webkit-line-clamp: 2;
  // word-break: break-all;
}

.file-size {
  color: #9f9f9f;
}
</style>
