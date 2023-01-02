<template>
  <el-button type="primary" size="large" @click="feedbackVisible = true"
    >意见反馈</el-button
  >
  <el-dialog
    v-model="feedbackVisible"
    title="意见反馈"
    :width="CreateDialogWidth"
    destroy-on-close
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      class="feedback-form"
      :label-width="CreateDialogLabelWidth"
      :style="{ maxHeight: `${CreateDialogContentHeight}vh` }"
      label-position="top"
    >
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="0">建议</el-radio>
          <el-radio :label="1">问题</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="详细描述" prop="content">
        <el-input
          v-model="form.content"
          maxlength="200"
          placeholder="请输入你的描述"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="相关文件" prop="file">
        <UploadFile
          :multiple="true"
          :limit="9"
          uploadButtonText="上传附件"
          :fileList="form.file"
          @on-remove="handleRemove"
          @on-add="handleAdd"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end mt-2">
        <el-button type="primary" @click="onSubmit(formRef)">提交</el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FeedbackDialog",
});
</script>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ElMessageBox, ElForm, ElMessage } from "element-plus";
import UploadFile from "@/components/UploadFile/index.vue";
import { createFeedback } from "@/api/feedback";
import {
  CreateDialogWidth,
  CreateDialogLabelWidth,
  CreateDialogContentHeight,
} from "@/constant/common";

type FormInstance = InstanceType<typeof ElForm>;
const formRef = ref<FormInstance>();
const feedbackVisible = ref(false);

const form = reactive({
  type: "",
  content: "",
  file: [],
});
const rules = reactive({
  type: [
    {
      required: true,
      message: "请选择类型",
      trigger: "change",
    },
  ],
  content: [
    {
      required: true,
      message: "请输入详细说明",
      trigger: "blur",
    },
  ],
});
// 附件上传
const handleRemove = ({ url }) => {
  form.file = form.file.filter((item) => item.attachmentUrl !== url);
};
const handleAdd = ({ name, url }) => {
  form.file.push({ name, attachmentUrl: url });
};
const handleClose = () => {
  ElMessageBox.confirm("退出后将无法保存更改，是否确定退出？").then(() => {
    formRef.value?.resetFields();
    feedbackVisible.value = false;
  });
};
const onSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl
    .validate()
    .then((valid) => {
      if (!valid) {
        return false;
      }
      const { type, content, file } = form;
      const params = {
        type,
        content,
        file: file
          .map((item) => {
            return item.attachmentUrl;
          })
          .join(","),
        platform: window["$platform"] === "win32" ? 0 : 1,
      };
      createFeedback(params)
        .then(() => {
          ElMessage.success({ message: "提交成功" });
          formEl.resetFields();
          feedbackVisible.value = false;
        })
        .catch((err) => {
          ElMessage.error({ message: `提交失败${err}` });
        });
    })
    .catch((err) => console.log(err));
};
</script>
<style lang="less" scoped>
.feedback-form {
  overflow: auto;
  padding-right: 10px;
}
.el-button {
  margin-right: 20px !important;
}
</style>
