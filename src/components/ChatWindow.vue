<template>
  <a-layout class="customer-service">
    <a-layout-content>
      <!-- Flex container for title and link -->
      <a-row>
        <a-col :span="20">
          <a-typography-title :level="3">运维问答</a-typography-title>
        </a-col>
        <a-col :span="4" style="margin-top: 1.5rem">
          <!-- Conditionally display UserProfile if user is logged in, else show login link -->
          <div v-if="isLoggedIn">
            <UserProfile />
          </div>
          <router-link v-else to="/login">登录邮箱</router-link>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="20">
          <a-typography-text type="success"
            >中国科技网全心全意为您服务</a-typography-text
          >
        </a-col>
      </a-row>

      <!-- Chat messages -->
      <div class="chat-window">
        <!-- <div v-for="(message, index) in userMessages" :key="index" class="message" :class="message.type">
          {{ message.text }}
        </div> -->
        <div
          v-for="(message, index) in userMessages"
          :key="index"
          class="message"
          :class="message.type"
        >
          {{ message.text }}
        </div>
      </div>
    </a-layout-content>

    <!-- Input box and button at the bottom -->
    <a-layout-footer>
      <a-row :gutter="16">
        <!-- Input field occupying most of the row -->
        <a-col :xs="18" sm="19" md="22" lg="22" xl="23">
          <a-input
            :value="userInput"
            @input="handleInput"
            placeholder="请输入您要咨询的内容"
            @keypress.enter="submitMessage"
          />
        </a-col>
        <!-- Button occupying a small part of the row -->
        <a-col :xs="6" sm="5" md="2" lg="2" xl="1">
          <a-button type="primary" block @click="submitMessage">提交</a-button>
        </a-col>
      </a-row>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import { Input, Button, Layout, Row, Col } from "ant-design-vue";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Cookies from "js-cookie";
import UserProfile from "@/components/UserProfile.vue"; // Make sure to import UserProfile

export default {
  name: "chatwindow",
  components: {
    "a-input": Input,
    "a-button": Button,
    "a-layout": Layout,
    "a-layout-content": Layout.Content,
    "a-layout-footer": Layout.Footer,
    "a-row": Row,
    "a-col": Col,
    UserProfile,
  },
  setup() {
    const userInput = ref("");
    const userMessages = ref([]); // Store messages as an array
    let socket = null;
    // let currentBotMessage = ''; // Temporary variable to hold assistant message
    let currentBotMessageIndex = null; // Index of the current assistant message being updated
    let sessionId = sessionStorage.getItem("session_id");

    // Check if the user is logged in by checking the JWT cookie
    const token = Cookies.get("jwt");
    const isLoggedIn = computed(() => !!token); // User is logged in if token exists

    // const API_URL = import.meta.env.VITE_API_URL;

    const submitMessage = () => {
      if (userInput.value.trim()) {
        // console.log(userInput.value)
        // Push user message to the messages array
        userMessages.value.push({ text: userInput.value, type: "user" });
        if (socket) {
          socket.send(JSON.stringify({ question: userInput.value }));
        }
        userInput.value = ""; // Clear the input after submission
        // currentBotMessage='';
        currentBotMessageIndex = 0;
      }
    };

    const handleInput = (e) => {
      userInput.value = e.target.value;
    };

    const handleIncomingMessage = (event) => {
      const data = JSON.parse(event.data);

      // if the response data don't type property but have message property, means it's robot generated
      if (data.message && !data.type) {
        if (currentBotMessageIndex === 0) {
          // Push a new assistant message placeholder when receiving the first chunk
          userMessages.value.push({ text: "", type: "assistant" });
          // console.log(userMessages.value.length)
          currentBotMessageIndex = userMessages.value.length - 1; // Save the index of the current assistant message
        }
        // Concatenate the incoming chunk to the current assistant message
        userMessages.value[currentBotMessageIndex].text += data.message;
      }
      // if the response data have messages property, means it's chat history from redis
      else if (data.messages) {
        // Update chat with recent messages
        userMessages.value = data.messages || [];
      }
      // if the response data have session_id property, means it's first create the session id
      else if (data.session_id) {
        sessionId = data.session_id;
        sessionStorage.setItem("session_id", sessionId);
      }
    };

    // const  handleBeforeUnload= async () =>{
    //   const sessionId = sessionStorage.getItem("session_id");
    //   if (sessionId) {
    //     try {
    //       await axios.post(`${API_URL}api/v1/chat/delete_session/`, {
    //         session_id: sessionId,
    //       });
    //       sessionStorage.removeItem("session_id"); // Optionally remove session ID from sessionStorage
    //     } catch (error) {
    //       console.error("Error deleting session:", error);
    //     }
    //   }
    // };

    onMounted(() => {
      const finalSessionId =
        sessionId && sessionId !== "undefined" ? sessionId : "";
      // Establish WebSocket connection
      socket = new WebSocket(
        `ws://localhost:8000/ws/chat/?sessionid=${finalSessionId}`
      );

      // window.addEventListener("beforeunload", handleBeforeUnload);
      socket.onmessage = handleIncomingMessage; // Set the message handler

      socket.onopen = () => {
        console.log("WebSocket connection established");
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    });

    onBeforeUnmount(() => {
      // window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socket) {
        socket.close(); // Clean up the WebSocket connection
      }
    });

    return {
      userInput,
      userMessages,
      submitMessage,
      handleInput,
      isLoggedIn,
    };
  },
};
</script>

<style scoped>
.customer-service {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  text-align: center;
}

a-layout-content {
  flex: 1;
}

.chat-window {
  margin: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  height: 400px;
  overflow-y: auto;
}

.message {
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 5px;
}

.message.user {
  background-color: #e6f7ff;
  text-align: right;
}

.message.assistant {
  background-color: #f6ffed;
  text-align: left;
}
</style>
