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
        <div v-for="(message, index) in userMessages" :key="index" class="message" :class="message.type">
          {{ message.text }}
        </div>
      </div>
    </a-layout-content>

    <!-- Input box and button at the bottom -->
    <a-layout-footer>
      <a-row :gutter="16">
        <!-- Input field occupying most of the row -->
        <a-col :xs="18" sm="19" md="22" lg="22" xl="23" >
          <a-input :value="userInput" @input="handleInput" placeholder="请输入您要咨询的内容" @keypress.enter="submitMessage" />
        </a-col>
        <!-- Button occupying a small part of the row -->
        <a-col :xs="6" sm="5" md="2" lg="2" xl="1" >
          <a-button type="primary" block @click="submitMessage">提交</a-button>
        </a-col>
      </a-row>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import { Input, Button, Layout, Row, Col } from 'ant-design-vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'chatwindow',
  components: {
    'a-input': Input,
    'a-button': Button,
    'a-layout': Layout,
    'a-layout-content': Layout.Content,
    'a-layout-footer': Layout.Footer,
    'a-row': Row,
    'a-col': Col,
  },
  setup() {
    const userInput = ref('');
    const userMessages = ref([]);
    let socket = null;

    // Establish WebSocket connection when the component is mounted
    onMounted(() => {
      socket = new WebSocket(`ws://localhost:8000/ws/chat/`);
      
      // Handle receiving messages from the server
      socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        userMessages.value.push({ text: data.message, type: 'bot' });
      };

      socket.onclose = function() {
        console.error("Chat socket closed unexpectedly");
      };
    });

    // Clean up WebSocket when the component is destroyed
    onBeforeUnmount(() => {
      if (socket) {
        socket.close();
      }
    });

    const submitMessage = () => {
      if (userInput.value.trim()) {
        // Push user's message to the chat window
        userMessages.value.push({ text: userInput.value, type: 'user' });
        
        // Send the message through the WebSocket
        socket.send(JSON.stringify({ 'message': userInput.value }));

        // Clear input field
        userInput.value = '';
      }
    };

    const handleInput = (e) => {
      userInput.value = e.target.value;
    };

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
