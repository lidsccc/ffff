<template>
  <div
    class="editor w-full"
    ref="editorRef"
    @compositionstart="compositionstart"
    @compositionend="compositionend"
    @keydown="onKeyDownInput"
    @click="onClickEditor"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EditorInput",
});
</script>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, reactive, watch } from "vue";
import WangEditor from "wangeditor";
import htmlToText from "html-to-text";

const props = defineProps<{ content: string }>();
const emits = defineEmits(["on-change-content", "on-submit"]);

let instance;
onMounted(() => {
  instance = new WangEditor(editorRef.value);
  Object.assign(instance.config, {
    placeholder: "",
    menus: ["emoticon"], // 显示菜单按钮
    showFullScreen: false, // 不显示全屏按钮
    height: "80",
    focus: false, // 取消自动 focus
    pasteFilterStyle: true, // 样式过滤
    pasteIgnoreImg: true, // 如果复制的内容有图片又有文字，则只粘贴文字，不粘贴图片
    pasteTextHandle: (str) => {
      const text = htmlToText.convert(str, {
        ignoreHref: true,
      });
      const { content } = props;
      emits("on-change-content", content + text);
    },
    onchange: (html) => {
      emits("on-change-content", filterXSS(instance.txt.html()));
    },
  });
  instance.create();
});
onBeforeUnmount(() => {
  instance.destroy();
  instance = null;
});

watch(
  () => props.content,
  (newValue) => {
    if (instance) {
      instance.config.focus = true;
      instance.txt.html(newValue);
    }
  }
);

const editorRef = ref();

const content = reactive({
  isChineseInputMethod: false, // 是否中文输入法状态中
  position: "",
  isRendering: false,
});

// 获取当前光标坐标
const setRecordCoordinates = () => {
  try {
    // getSelection() 返回一个 Selection 对象，表示用户选择的文本范围或光标的当前位置
    const selection = getSelection();
    content.position = {
      range: selection.getRangeAt(0),
      selection: selection,
    };
  } catch (error) {
    console.log(error, "光标获取失败了～");
  }
};

// 中文输入触发
const compositionstart = () => {
  content.isChineseInputMethod = true;
};
// 中文输入关闭
const compositionend = () => {
  content.isChineseInputMethod = false;
};

const handleSend = () => {
  console.log(instance.txt.text());
  emits("on-submit", instance.txt.text());
  instance.txt.clear();
};

// keydown触发事件 记录光标
const onKeyDownInput = async (e) => {
  // shift + enter 换行事件
  if (e.key === "Enter" && e.shiftKey) {
    return;
  }

  // enter 发送消息
  if (e.key === "Enter" && !e.shiftKey) {
    handleSend();
    return;
  }

  // @
  const isCode =
    ((e.keyCode === 229 && e.key === "@") ||
      (e.keyCode === 229 && e.code === "Digit2") ||
      e.keyCode === 50) &&
    e.shiftKey;
  if (!content.isChineseInputMethod && isCode) {
    setRecordCoordinates(); // 保存坐标
    // 打开弹窗的方法
    console.log("输入了@");
  }
};
// 每次点击获取更新坐标
const onClickEditor = () => {
  setRecordCoordinates();
};

//弹窗列表 - 选人 - 生成@的内容
const createSelectElement = (name, id, type = "default") => {
  // 获取当前文本光标的位置。
  const { selection, range } = content.position;
  // 生成需要显示的内容
  let spanNodeFirst = document.createElement("span");
  spanNodeFirst.style.color = "#409EFF";
  spanNodeFirst.innerHTML = `@${name}&nbsp;`; // @的文本信息
  spanNodeFirst.dataset.id = id; // 用户ID、为后续解析富文本提供
  spanNodeFirst.contentEditable = false; // 当设置为false时，富文本会把成功文本视为一个节点。

  // 需要在字符前插入一个空格否则、在换行与两个@标签连续的时候导致无法删除标签
  let spanNode = document.createElement("span");
  spanNode.innerHTML = "&nbsp;";

  //创建一个新的空白的文档片段，拆入对应文本内容
  let frag = document.createDocumentFragment();
  frag.appendChild(spanNode);
  frag.appendChild(spanNodeFirst);

  // 如果是键盘触发的默认删除面前的@，前文中我们没有阻止@的生成所以要删除@的再插入ps：如果你是数组遍历的请传入type 不然会一直删除你前面的字符。
  if (type === "default") {
    const textNode = range.startContainer;
    range.setStart(textNode, range.endOffset - 1);
    range.setEnd(textNode, range.endOffset);
    range.deleteContents();
    this.isKeyboard = false; // 针对多选的逻辑
  }

  // 判断是否有文本、是否有坐标
  if (
    (this.editor.txt.text() || type === "default") &&
    this.position &&
    range
  ) {
    range.insertNode(frag);
  } else {
    // 如果没有内容一开始就插入数据特别处理
    this.editor.txt.append(
      `<span data-id="${id}" style="color: #409EFF" contentEditable="false">@${name}&nbsp;</span>`
    );
  }
};
</script>

<style lang="less" scoped>
.editor {
  :deep(.w-e-toolbar) {
    border: none !important;
    // border: 1px solid #ddd;
    background-color: transparent !important;
    z-index: 1 !important;
  }
  :deep(.w-e-text-container) {
    border: none !important;
    // border: 1px solid #ddd;
    background-color: transparent !important;
  }
  :deep(.w-e-text) {
    padding: 0 4px 12px 12px;
  }
  :deep(.w-e-text p) {
    margin: 0;
    font-size: 16px;
  }
  :deep(.w-e-text-container .placeholder) {
    top: 4px;
    left: 8px;
  }
  :deep(.w-e-menu .w-e-panel-container) {
    margin: 0 !important;
    left: 0;
    top: -270px;
  }
  :deep(.w-e-menu-tooltip) {
    display: none !important;
  }
  :deep(.w-e-toolbar .w-e-menu:hover) {
    background-color: transparent !important;
    i {
      color: rgb(153, 153, 153);
    }
  }
  :deep(.w-e-icon-happy) {
    @apply w-6 p-1 mr-2 cursor-pointer rounded-md hover:bg-gray-300;
  }
}
</style>
