<template>
  <el-form ref="formRef" :model="form" label-width="100px" class="repeat-form">
    <el-form-item label="重复频率">
      <div class="flex items-center">
        <el-select
          class="unit-select"
          :modelValue="props.data.unit"
          @update:modelValue="(val) => handleDataChange('unit', val)"
        >
          <el-option
            v-for="item in meetingRepeatOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input-number
          class="ml-4"
          :modelValue="props.data.intervalInt"
          @update:modelValue="(val) => handleDataChange('intervalInt', val)"
          :min="1"
          :max="99"
          @change="handleChange"
        />
      </div>
    </el-form-item>
    <div class="mt-4">
      <el-form-item label="截止日期">
        <el-radio
          :modelValue="props.data.deadlineType"
          @update:modelValue="(val) => handleDataChange('deadlineType', val)"
          :label="1"
          >永不结束</el-radio
        >
        <el-radio
          :modelValue="props.data.deadlineType"
          @update:modelValue="(val) => handleDataChange('deadlineType', val)"
          :label="2"
        >
          <div class="mr-2">截止日期</div>
          <el-date-picker
            :disabled="props.data.deadlineType !== 2"
            :modelValue="props.data.deadline"
            @update:modelValue="(val) => handleDataChange('deadline', val)"
            type="date"
            placeholder="请选择截止日期"
          />
        </el-radio>
      </el-form-item>
    </div>
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CustomRepeatCalendar",
});
</script>

<script lang="ts" setup>
import { ref } from "vue";
import { meetingRepeatOptions } from "@/constant/calendar";

type Props = {
  data: object;
};
const props = defineProps<Props>();
const emits = defineEmits(["on-data-change"]);

const formRef = ref();

const handleDataChange = (key, val) => {
  emits("on-data-change", { ...props.data, [key]: val });
};
</script>

<style lang="less" scoped>
.repeat-form {
  .unit-select {
    width: 120px;
  }
  .el-input-number {
    width: 120px;
  }
  :deep(.el-date-editor) {
    width: 140px;
  }
  :deep(.el-radio__label) {
    display: flex;
  }
}
</style>
