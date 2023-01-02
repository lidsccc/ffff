<template>
  <el-dialog
    :modelValue="props.visible"
    @update:model-value="closeDialog"
    :title="`${isEdit ? '编辑' : '新建'}共享人员`"
    :width="CreateDialogWidth"
    destroy-on-close
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :rules="rules"
      :model="form"
      label-position="right"
      :label-width="CreateDialogLabelWidth"
      class="share-form"
    >
      <el-form-item prop="users">
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/contacts_icon.png" class="icon" />
            <span>人员:</span>
          </div>
        </template>
        <el-input
          :modelValue="selectedUser"
          placeholder="添加联系人"
          @click="isContactSelectVisible = true"
        />
        <ContactSelect
          :visible="isContactSelectVisible"
          :selected="form.users"
          :max-limit="1"
          @on-visible-change="handleContactSelectVisibleChange"
          @on-cancel="cancelContactSelect"
          @on-confirm="confirmContactSelect"
        />
      </el-form-item>
      <el-form-item>
        <template #label>
          <div class="labelTemplate">
            <img src="@/assets/share-type.png" class="icon" />
            <span>类型:</span>
          </div>
        </template>
        <el-select v-model="form.type">
          <el-option
            v-for="item in calendarShareOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end mt-2">
        <el-button type="primary" @click="onSubmit(formRef)">确定</el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CreateAddShareDialog",
});
</script>
<script lang="ts" setup>
import { withDefaults, ref, computed, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { ElForm } from "element-plus";
import { addShare } from "@/api/calendar";
import ContactSelect from "@/components/ContactSelect/index.vue";
import { calendarShareOptions } from "@/constant/calendar";
import { CreateDialogWidth, CreateDialogLabelWidth } from "@/constant/common";
interface Props {
  visible: boolean;
}
type FormInstance = InstanceType<typeof ElForm>;
const formRef = ref<FormInstance>();
const isEdit = ref(false);
const emits = defineEmits(["on-cancel", "on-confirm"]);
const props = withDefaults(defineProps<Props>(), { visible: true });
const form = reactive({
  users: [],
  type: 1,
});
const rules = reactive({
  users: [
    {
      required: true,
      message: "请选择人员",
      trigger: "change",
    },
  ],
});
const closeDialog = () => {
  emits("on-cancel");
};
const isContactSelectVisible = ref(false);
const selectedUser = computed(() => {
  return form.users.map((item) => item.name).join(",");
});
const handleContactSelectVisibleChange = (visible) => {
  isContactSelectVisible.value = visible;
};
const cancelContactSelect = () => {
  isContactSelectVisible.value = false;
};
const confirmContactSelect = (list) => {
  form.users = list;
  isContactSelectVisible.value = false;
};
const handleClose = () => {
  ElMessageBox.confirm("退出后将无法保存更改，是否确定退出？").then(() => {
    form.users = [];
    formRef.value?.resetFields();
    closeDialog();
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
      const { users, type } = form;
      const params: any = {
        shareVos: [
          {
            sharerId: [
              ...users.map((item) => {
                return item.id;
              }),
            ].join(),
            type,
          },
        ],
      };
      addShare(params)
        .then(() => {
          ElMessage.success({ message: "添加共享人员成功" });
          form.users = [];
          formEl.resetFields();
          emits("on-confirm");
        })
        .catch((err) => {
          ElMessage.error({ message: `添加共享人员失败：${err}` });
        });
    })
    .catch((err) => console.log(err));
};
</script>
<style lang="less" scoped>
.share-form {
  height: 20vh;
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
