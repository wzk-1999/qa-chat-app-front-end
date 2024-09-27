import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css"; // Import Ant Design styles

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/Router";

createApp(App).use(router).use(Antd).mount("#app");
