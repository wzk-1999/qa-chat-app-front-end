<template>
  <a-flex :justify="justify" :align="alignItems">
    <a-avatar
      size="large"
      :style="{ backgroundColor: '#f56a00', verticalAlign: 'middle' }"
      :gap="4"
    >
      {{ initials }}
    </a-avatar>
    <a-button type="link" :size="size">{{ email }}</a-button>
  </a-flex>
</template>

<script lang="ts">
import { computed, ref, defineComponent } from "vue";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import type { FlexProps } from "ant-design-vue";
import type { SizeType } from "ant-design-vue/es/config-provider";

export default defineComponent({
  name: "UserProfile",
  setup() {
    const justify = ref<FlexProps["justify"]>("flex-end");
    const alignItems = ref<FlexProps["align"]>("flex-start"); // Adjust align for vertical centering
    const size = ref<SizeType>("large");

    const token = Cookies.get("jwt"); // Get token from cookies
    const decodedToken = jwtDecode(token) as { email: string };

    const email = decodedToken?.email || "";

    const initials = computed(() => {
      return email.charAt(0).toUpperCase();
    });

    return { email, initials, justify, alignItems, size };
  },
});
</script>

<style scoped></style>
