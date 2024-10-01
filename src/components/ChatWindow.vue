<template>
  <!-- <meta name="csrf-token" content="{{ csrf_token }}" /> -->
  <!-- only works in Django Template Rendering -->
  <a-layout class="customer-service">
    <a-layout-header
      :style="{
        position: 'fixed',
        zIndex: 1,
        width: '99%',
        height: '5rem',
        borderRadius: '0.7rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }"
    >
      <!-- Flex container for title and link -->
      <a-row>
        <a-col :xs="16" :sm="18" :md="20">
          <a-space-compact direction="vertical">
            <a-typography-title :level="4" :style="{ color: 'white' }"
              >运维问答</a-typography-title
            >
            <a-typography-text type="success"
              >中国科技网全心全意为您服务</a-typography-text
            >
          </a-space-compact>
        </a-col>
        <a-col :xs="8" :sm="6" :md="4" style="margin-top: 1rem">
          <!-- Conditionally display UserProfile if user is logged in, else show login link -->
          <div v-if="isLoggedIn">
            <UserProfile />
          </div>
          <router-link v-else to="/login">登录邮箱</router-link>
        </a-col>
      </a-row>
    </a-layout-header>

    <a-layout-content>
      <!-- Chat messages -->
      <div class="chat-window">
        <div
          v-for="message in userMessages"
          :key="message.id"
          class="message"
          :class="message.type"
        >
          <span v-html="renderMarkdown(message.text)"></span>
          <!-- Display copy icon for assistant messages only -->
          <div
            style="
              background-color: #edf2fa;
              border-radius: 0.7rem;
              padding: 0.5rem;
            "
          >
            <template v-if="message.type === 'assistant'">
              <tooltip title="复制" placement="top">
                <CopyOutlined
                  @click="handleCopy(message.text)"
                  style="font-size: 1rem; cursor: pointer; margin-left: 1rem"
                />
              </tooltip>
              <tooltip
                :title="message.isLiked ? '取消点赞' : '点赞'"
                placement="top"
              >
                <span
                  @click="handleLikeToggle(message.id)"
                  style="cursor: pointer; margin-left: 1rem"
                >
                  <!-- <component
                    :is="isLiked ? LikeFilled : LikeOutlined"
                    style="font-size: 1rem"
                  /> -->
                  <LikeFilled v-if="message.isLiked" style="font-size: 1rem" />
                  <LikeOutlined v-else style="font-size: 1rem" />
                </span>
              </tooltip>
              <!-- Dislike button with toggle functionality -->
              <tooltip
                :title="message.isDisliked ? '取消踩' : '没有用'"
                placement="top"
              >
                <span
                  @click="handleDislikeToggle(message.id)"
                  style="cursor: pointer; margin-left: 1rem"
                >
                  <!-- <component
                    :is="isDisliked ? DislikeFilled : DislikeOutlined"
                    style="font-size: 1rem"
                  /> -->
                  <!-- Directly render the appropriate icon based on isDisliked -->
                  <DislikeFilled
                    v-if="message.isDisliked"
                    style="font-size: 1rem"
                  />
                  <DislikeOutlined v-else style="font-size: 1rem" />
                </span>
              </tooltip>
            </template>
          </div>
        </div>
      </div>
    </a-layout-content>

    <!-- Input box and button at the bottom -->
    <a-layout-footer
      :style="{
        position: 'fixed',
        zIndex: 1,
        width: '100%',
        bottom: 0,
        width: '99%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: '0.7rem',
      }"
    >
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
import {
  Input,
  Button,
  Layout,
  Row,
  message as alertMessage,
  Col,
  Tooltip,
} from "ant-design-vue";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Cookies from "js-cookie";
import UserProfile from "@/components/UserProfile.vue"; // Make sure to import UserProfile
import MarkdownIt from "markdown-it"; // Import MarkdownIt
import {
  CopyOutlined,
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled,
} from "@ant-design/icons-vue";
import { v4 as uuidv4 } from "uuid"; // Use a library like uuid to generate unique IDs
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
    UserProfile,
    Tooltip, // Register Tooltip component
    CopyOutlined, // Register the CopyOutlined component
    LikeOutlined,
    DislikeOutlined,
    LikeFilled,
    DislikeFilled,
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

    const API_URL = import.meta.env.VITE_API_URL;

    const handleCopy = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        alertMessage.success("复制成功", 2); // Show success message for 2 seconds
      });
    };

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      .split("=")[1];

    const handleLikeToggle = async (messageId) => {
      const message = userMessages.value.find((msg) => msg.id === messageId);

      if (message) {
        try {
          console.log(message.isLiked);
          // Determine the like status to send to the backend
          const newLikeStatus = !message.isLiked;

          // Send the like/unlike request to the backend
          await axios.post(
            `${API_URL}api/v1/message/like/`,
            {
              messageId: message.id,
              isLiked: newLikeStatus,
            },
            {
              headers: {
                "X-CSRFToken": csrfToken, // Add CSRF token to the request headers
              },
              withCredentials: true, // If using cookies for authentication
            }
          );

          if (message.isLiked) {
            message.isLiked = false;
            alertMessage.success("已取消点赞", 2);
          } else {
            message.isLiked = true;
            alertMessage.success("感谢您的认可", 2);
          }
        } catch (error) {
          // Handle any error from the backend request
          alertMessage.error("操作失败，请重试", 2);
        }
      }
    };

    const handleDislikeToggle = (messageId) => {
      const message = userMessages.value.find((msg) => msg.id === messageId);

      if (message) {
        if (message.isDisliked) {
          message.isDisliked = false;
          alertMessage.success("已取消踩", 2);
        } else {
          message.isDisliked = true;
          alertMessage.success("已收到您的反馈", 2);
        }
      }
    };

    const preprocessText = (text) => {
      // Use regex to target content between triple backticks and remove any backticks inside
      return text.replace(/```(.*?)```/gs, (match, code) => {
        // Remove backticks from within the code block content
        const sanitizedCode = code.replace(/`/g, "");
        return `\`\`\`${sanitizedCode}\`\`\``;
      });
    };

    // Initialize MarkdownIt with the 'breaks' option enabled
    const md = new MarkdownIt({
      // breaks: true, // Respect single-line breaks
    });

    // Function to render markdown
    const renderMarkdown = (text) => {
      const processedText = preprocessText(text); // Preprocess the text to remove backticks inside code blocks

      return md.render(processedText);
    };

    const submitMessage = () => {
      if (userInput.value.trim()) {
        // Generate a unique ID for the new message
        const messageId = uuidv4();
        // Push the user message with a unique ID
        userMessages.value.push({
          id: messageId,
          text: userInput.value,
          type: "user",
        });
        if (socket) {
          socket.send(
            JSON.stringify({ question: userInput.value, id: messageId })
          );
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
          userMessages.value.push({
            text: "",
            type: "assistant",
            isLiked: false,
            isDisliked: false,
          });
          // console.log(userMessages.value.length)
          currentBotMessageIndex = userMessages.value.length - 1; // Save the index of the current assistant message
        }
        // Concatenate the incoming chunk to the current assistant message
        userMessages.value[currentBotMessageIndex].text += data.message;
      }
      // if the response data have messages property, means it's chat history from redis
      else if (data.messages) {
        // if (data.messages.length > 0) {
        //   console.log(data.messages[3].text);
        // }

        // Update chat with recent messages
        userMessages.value = data.messages || [];
      }
      // if the response data have session_id property, means it's first create the session id
      else if (data.session_id) {
        sessionId = data.session_id;
        sessionStorage.setItem("session_id", sessionId);
      }
      // if the response data have id property, means it's returning the message id
      else if (data.id) {
        userMessages.value[currentBotMessageIndex].id = data.id;
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
      renderMarkdown, // Expose renderMarkdown for template usage
      handleCopy, // Expose handleCopy for template usage
      handleLikeToggle,
      handleDislikeToggle,
      // isLiked,
      // isDisliked,
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
  overflow-y: auto;
  margin-top: 5rem;
  height: calc(100vh - 9rem); /* Full height minus header and footer */
}

.message {
  padding: 3px 5px;
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

/* Deep selector to apply scoped styles to dynamically generated HTML */
:deep(code) {
  background-color: #221515;
  color: white;
  padding: 0px 8px;
}
</style>
