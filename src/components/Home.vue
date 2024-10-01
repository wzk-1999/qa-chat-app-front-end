<template>
  <a-layout class="home-container">
    <UserProfile />
    <a-divider style="height: 2px; background-color: #7cb305" />
    <a-row>
      <a-col :span="20"
        ><a-typography-title style="text-align: center"
          >欢迎来到首页</a-typography-title
        ></a-col
      >
      <a-col :span="4">
        <a-flex :justify="justify"
          ><router-link to="/" style="padding-top: 1rem"
            >大模型问答</router-link
          ></a-flex
        ></a-col
      >
    </a-row>
    <div v-html="renderedMarkdown" class="markdown-content"></div>
  </a-layout>
</template>

<script lang="ts">
import UserProfile from "./UserProfile.vue";
import type { FlexProps } from "ant-design-vue";
import { ref } from "vue";
import MarkdownIt from "markdown-it"; // Import MarkdownIt

export default {
  components: {
    UserProfile,
  },
  setup() {
    const justify = ref<FlexProps["justify"]>("center");
    // Create a MarkdownIt instance
    const md = new MarkdownIt({
      // breaks: true, // Respect single-line breaks
    });

    // Sample markdown content
    const markdownContent =
      "### 方法二：使用在线的Java编译器和运行器（如果需要快速测试）\n ### 方法一：在命令行（适用于基于Java的环境如IDEA，Eclipse等）```java " +
      "public" +
      "``` test";

    // Render the markdown content to HTML
    const renderedMarkdown = ref(md.render(markdownContent));

    return { justify, renderedMarkdown };
  },
};
</script>
