<template>
  <div>
    <el-button @click="drawer = true">创建日程</el-button>
    <el-drawer v-model="drawer" direction="rtl">
      <template #title>
        <h4>set title by slot</h4>
      </template>
      <template #default>
        <div>
          <el-radio v-model="radio1" label="Option 1" size="large"
            >Option 1</el-radio
          >
          <el-radio v-model="radio1" label="Option 2" size="large"
            >Option 2</el-radio
          >
        </div>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="cancelClick">cancel</el-button>
          <el-button type="primary" @click="confirmClick">confirm</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CreateSchedule",
});
</script>

<script lang="ts" setup>
import { ref } from "vue";
const drawer = ref(false);
</script>
