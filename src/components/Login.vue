<!-- src/components/Login.vue -->
<template>
  <a-layout class="login-container">
    <div class="login-form">
      <div class="header-container">
        <h2>登录邮箱</h2>
        <router-link to="/" class="chatRobot">大模型问答</router-link>
      </div>
      <a-form @submit="submitLogin">
        <a-form-item>
          <!--ant design input requre you add the :value after v-model to achieve the normal v-model data two way binding -->
          <a-input
            v-model:value="email"
            placeholder="请输入您的邮箱"
            type="email"
            required
          />
        </a-form-item>
        <a-form-item>
          <a-input
            v-model:value="password"
            placeholder="请输入您的密码"
            type="password"
            required
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" block> 登录 </a-button>
        </a-form-item>
      </a-form>
    </div>
  </a-layout>
</template>

<script>
import { Input, Button, Layout, Form } from "ant-design-vue";
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default {
  name: "Login",
  components: {
    "a-input": Input,
    "a-button": Button,
    "a-layout": Layout,
    //"a-layout-content": Layout.Content,
    "a-form": Form,
    "a-form-item": Form.Item,
  },
  setup() {
    const email = ref("");
    const password = ref("");
    const API_URL = import.meta.env.VITE_API_URL;
    const router = useRouter();

    const fetchCSRFToken = async () => {
      try {
        const response = await axios.get(`${API_URL}api/v1/get_csrf_token/`, {
          withCredentials: true,
        });
        return response.data.csrfToken;
      } catch (error) {
        console.error("Failed to fetch CSRF token", error);
      }
    };

    const submitLogin = async () => {
      /* console.log(
        "Logging in with email:",
        email.value,
        "and password:",
        password.value
      );*/

      // Here you would normally send the login data to the server
      try {
        await fetchCSRFToken();

        const response = await axios.post(`${API_URL}api/v1/login/`, {
          email: email.value,
        });
        const token = response.data.access;

        const decodedToken = jwtDecode(token);
        const expTimestamp = decodedToken.exp;
        const expDate = new Date(expTimestamp * 1000); // Convert from seconds to milliseconds

        // Store the token in a cookie with an expiration same with jwt token expire time
        // but in the browser application tab, the cookie expire time always will be displayed as UTC time

        Cookies.set("jwt", token, { expires: expDate, secure: true });
        router.push("/home");
      } catch (error) {
        console.error("Login failed", error);
      }
    };

    return {
      email,
      password,
      submitLogin,
    };
  },
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

/*h2 {
  text-align: center;
  margin-bottom: 20px;
}
*/

.header-container {
  display: flex;
  justify-content: center;
  position: relative;
  padding-bottom: 1rem;
}

h2 {
  margin: 0;
}

.chatRobot {
  position: absolute;
  right: 1rem;
  top: 0;
}
</style>
