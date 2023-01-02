<template>
  <el-dialog
    :modelValue="props.visible"
    @update:model-value="closeDialog"
    title="分享"
    width="600px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" label-width="40px" class="share-form">
      <el-form-item prop="person" label-width="auto">
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/contacts_icon.png" class="icon" />
            <span>人员:</span>
          </div>
        </template>
        <el-input
          :modelValue="selectedUser"
          placeholder="添加分享人"
          @click="isContactSelectVisible = true"
        />
        <ContactSelect
          :visible="isContactSelectVisible"
          :selected="form.userId"
          @on-visible-change="handleContactSelectVisibleChange"
          @on-cancel="cancelContactSelect"
          @on-confirm="confirmContactSelect"
        />
      </el-form-item>
      <el-form-item label-width="auto">
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/desc_icon.png" class="icon" />
            <span>留言:</span>
          </div>
        </template>
        <el-input
          v-model="form.moreInfo"
          :rows="3"
          show-word-limit
          type="textarea"
          placeholder="留言信息"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-center">
        <el-button type="primary" @click="onSubmit(formRef)">确定</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ShareCalendarDialog",
});
</script>

<script lang="ts" setup>
import { ref, reactive, computed, withDefaults } from "vue";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { shareCalendarParams, shareCalendar } from "@/api/calendar";
import { ElMessage } from "element-plus";
const emits = defineEmits(["on-cancel", "on-confirm"]);
interface Props {
  visible: boolean;
  detail?: object;
}
const props = withDefaults(defineProps<Props>(), { visible: true });
const isContactSelectVisible = ref(false);
import type { ElForm } from "element-plus";
type FormInstance = InstanceType<typeof ElForm>;
const formRef = ref<FormInstance>();
const selectedUser = computed(() => {
  return form.userId.map((item) => item.name).join(",");
});
const handleContactSelectVisibleChange = (visible) => {
  isContactSelectVisible.value = visible;
};
const cancelContactSelect = () => {
  isContactSelectVisible.value = false;
};
const confirmContactSelect = (list) => {
  form.userId = list;
  isContactSelectVisible.value = false;
};
const form = reactive({
  userId: [],
  type: 0,
  moreInfo: "",
});
const onSubmit = (formEl: FormInstance | undefined) => {
  const { userId, type, moreInfo } = form;
  if (!userId.length) {
    return ElMessage.warning({ message: "请选择分享人" });
  }
  const params: shareCalendarParams = {
    id: props.detail.id,
    type,
    moreInfo,
    userId: [
      ...userId.map((item) => {
        return item.id;
      }),
    ].join(),
  };
  shareCalendar(params)
    .then(() => {
      ElMessage.success({ message: "分享成功" });
      form.userId = [];
      form.moreInfo = "";
      emits("on-confirm");
    })
    .catch((err) => {
      ElMessage.error({ message: `分享失败：${err}` });
    });
};
const closeDialog = () => {
  emits("on-cancel");
};
</script>
<style lang="less" scoped>
.share-form {
  height: 25vh;
  overflow: auto;
  padding-right: 10px;
  .icon {
    @apply w-6 h-6;
  }
  .labelTemplate {
    @apply flex items-center;
    img {
      @apply mr-1;
    }
  }
  :deep(.el-form-item__label) {
    @apply flex mt-1;
  }
  :deep(.el-range-editor) {
    @apply w-full;
  }
  .el-select {
    @apply w-full;
  }
}
</style>
