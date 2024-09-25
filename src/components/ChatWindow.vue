<template>
  <a-layout class="customer-service">
    <a-layout-content>
      <h2>运维问答</h2>
      <p>中国科技网全心全意为您服务</p>
      <div class="options">
        <a href="#">活动</a>
        <a href="#">套餐</a>
        <a href="#">预约</a>
      </div>

      <!-- Chat messages -->
      <div class="chat-window">
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";

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
  },
  setup() {
    const userInput = ref("");
    const userMessages = ref([]);
    let eventSource = null;

    function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Check if this cookie string begins with the name we want
          if (cookie.substring(0, name.length + 1) === name + "=") {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }

    const handleInput = (e) => {
      userInput.value = e.target.value;
    };

    const API_URL = import.meta.env.VITE_API_URL;
    // console.log(API_URL)

    // Function to handle submitting the message
    const submitMessage = async () => {
      // console.log(userInput.value)
      // console.log("user messages array: ", userMessages.value); // Log the user messages array
      if (userInput.value.trim()) {
        userMessages.value.push({ text: userInput.value, type: "user" });

        // Send the message and session ID to the back-end
        try {
          // console.log(document.cookie);
          // console.log(getCookie("csrftoken"));
          axios.defaults.withCredentials = true; // Allow credentials to be sent with requests

          axios.defaults.headers.common["X-CSRFToken"] = getCookie("csrftoken"); // Implement getCookie to fetch CSRF token
          // console.log(sessionStorage.getItem("session_id"));
          await axios.post(`${API_URL}api/v1/chat/stream/`, {
            session_id: sessionStorage.getItem("session_id"), // Send the session ID in the request body
            question: userInput.value,
          });
          userInput.value = "";
          let currentBotMessageIndex = 0; // Index of the current bot message being updated
          // Start listening to the SSE response after sending the question
          const eventSource = new EventSource(
            `${API_URL}api/v1/chat/stream/sse/?session_id=${sessionStorage.getItem(
              "session_id"
            )}`
          );

          eventSource.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message) {
              if (currentBotMessageIndex === 0) {
                // Push a new bot message placeholder when receiving the first chunk
                userMessages.value.push({ text: "", type: "bot" });
                // console.log(userMessages.value.length)
                currentBotMessageIndex = userMessages.value.length - 1; // Save the index of the current bot message
              }
              // Concatenate the incoming chunk to the current bot message
              userMessages.value[currentBotMessageIndex].text +=
                message.message;
            }
          };

          // Close the EventSource after completing
          eventSource.onclose = () => {
            console.log("SSE connection closed.");
          };
        } catch (error) {
          console.error("Error sending message:", error);
        }

        // currentBotMessageIndex=0;
      }
    };

    onMounted(async () => {
      // Load recent 10 messages when the page renders
      await loadRecentMessages();
    });

    const loadRecentMessages = async () => {
      try {
        const sessionId = sessionStorage.getItem("session_id");
        const finalSessionId =
          sessionId && sessionId !== "undefined" ? sessionId : "";
        const response = await axios.get(
          `${API_URL}api/v1/inquiry/?session_id=${finalSessionId}`
        );

        const { session_id, messages } = response.data;

        // Store session ID in sessionStorage
        sessionStorage.setItem("session_id", session_id);

        // Update chat with recent messages
        userMessages.value = messages || [];
      } catch (error) {
        console.error("Error loading recent messages:", error);
      }
    };

    onBeforeUnmount(() => {
      if (eventSource) {
        eventSource.close();
      }
    });

    return {
      userInput,
      userMessages,
      submitMessage,
      handleInput,
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

.options {
  margin: 10px 0;
  display: flex;
  justify-content: center;
}

.options a {
  margin: 0 15px;
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

.message.bot {
  background-color: #f6ffed;
  text-align: left;
}
</style>
