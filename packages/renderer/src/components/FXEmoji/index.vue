<template>
  <div class="emoji">
    <ul class="emoji-default">
      <li
        v-for="(item, index) in emojis"
        :key="index"
        @click.stop="chooseEmojiDefault(item)"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import emojiJson from "./emoji.json";

const emit = defineEmits(["select"]);
const emojis = ref(emojiJson.data.split(","));
const chooseEmojiDefault = (e: string) => {
  emit("select", e);
};
</script>

<style lang="less" scoped>
.emoji {
  background: #fff;

  .emoji-default {
    height: 180px;
    display: flex;
    flex-wrap: wrap;
    overflow-y: auto;

    li {
      display: inline-block;
      padding: 5px;
      font-size: 24px;
      width: 36px;
      height: 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      cursor: pointer;
    }

    li:hover {
      background-color: #d5d5d5;
    }
  }
}
</style>
