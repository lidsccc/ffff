<template>
  <el-upload
    action=""
    :http-request="handleUpload"
    :on-remove="handleRemove"
    :before-upload="beforeUpload"
    :before-remove="beforeRemove"
    :multiple="!!props.multiple"
    :limit="props.limit || 1"
    :file-list="fileList"
    ref="uploadFile"
    ><slot
      ><el-button type="primary">{{
        props.uploadButtonText || "添加附件"
      }}</el-button></slot
    >
  </el-upload>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UploadFile",
});
</script>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { UploadFile } from "element-plus/es/components/upload/src/upload.type";
import { upload } from "@/api/common";

type Props = {
  multiple: boolean;
  limit: number;
  fileList?: RawFile[];
  uploadButtonText?: string;
};
const uploadFile = ref();
const props = defineProps<Props>();
const emits = defineEmits([
  "on-remove",
  "on-add",
  "on-before-upload",
  "on-success",
]);

interface RawFile {
  name: string;
  url: string;
}

const fileList = computed(() => {
  return props.fileList?.map(({ name, attachmentUrl }) => ({
    name,
    url: attachmentUrl,
  }));
});
const handleUpload = ({ file }: any) => {
  const form = new FormData();
  form.append("file", file);
  upload(form)
    .then(({ resourceUrl }: any) => {
      emits("on-add", {
        name: file.name,
        url: resourceUrl,
      });
    })
    .catch((error: any) => {
      const failedUid = file.uid;
      ElMessage.error({ message: `上传失败：${error}` });
      uploadFile.value.uploadFiles = uploadFile.value.uploadFiles.filter(
        (item) => item.uid !== failedUid
      );
    });
};
const beforeRemove = (file: UploadFile, fileList: UploadFile[]) => {
  return ElMessageBox.confirm(`确定删除${file.name} ?`);
};
const handleRemove = (file: UploadFile) => {
  emits("on-remove", file);
};
// 上传前
const beforeUpload = (file: UploadFile) => {
  emits("on-before-upload", file);
};
</script>
