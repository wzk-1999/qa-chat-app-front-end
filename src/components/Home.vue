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
  </a-layout>
</template>

<script lang="ts">
import UserProfile from "./UserProfile.vue";
import type { FlexProps } from "ant-design-vue";
import { ref } from "vue";

export default {
  components: {
    UserProfile,
  },
  setup() {
    const justify = ref<FlexProps["justify"]>("center");
    return { justify };
  },
};
</script>
