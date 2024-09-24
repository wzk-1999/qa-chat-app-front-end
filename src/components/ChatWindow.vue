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
        <!-- <div v-for="(message, index) in userMessages" :key="index" class="message" :class="message.type">
          {{ message.text }}
        </div> -->
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
    const userMessages = ref([]); // Store messages as an array
    let socket = null;
    // let currentBotMessage = ''; // Temporary variable to hold bot message
    let currentBotMessageIndex = null; // Index of the current bot message being updated


    const submitMessage = () => {
      if (userInput.value.trim()) {
        // console.log(userInput.value)
        // Push user message to the messages array
        userMessages.value.push({ text: userInput.value, type: 'user' });
        if (socket) {
          socket.send(JSON.stringify({ question: userInput.value }));
        }
        userInput.value = ''; // Clear the input after submission
        // currentBotMessage='';
        currentBotMessageIndex=0;
      }
    };

    const handleInput = (e) => {
      userInput.value = e.target.value;
    };

    const handleIncomingMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        if (currentBotMessageIndex === 0) {
          // Push a new bot message placeholder when receiving the first chunk
          userMessages.value.push({ text: '', type: 'bot' });
          // console.log(userMessages.value.length)
          currentBotMessageIndex = userMessages.value.length - 1; // Save the index of the current bot message
        }
        // Concatenate the incoming chunk to the current bot message
        userMessages.value[currentBotMessageIndex].text += data.message;
      }
    };

    onMounted(() => {
      const sessionId = document.cookie.split('; ')
    .find(row => row.startsWith('sessionid'))
    ?.split('=')[1];
      // Establish WebSocket connection
      socket = new WebSocket(`ws://localhost:8000/ws/chat/?sessionid=${sessionId}`);

      socket.onmessage = handleIncomingMessage; // Set the message handler

      socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    });

    onBeforeUnmount(() => {
      if (socket) {
        socket.close(); // Clean up the WebSocket connection
      }
    });

    return {
      userInput,
      userMessages,
      submitMessage,
      handleInput
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
