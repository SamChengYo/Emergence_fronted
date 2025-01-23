<template>
  <a-row justify="center">
    <a-col :span="16">
      <a-card>
        <!-- 聊天框 -->
        <div class="chat-box" ref="chatBox">
          <div v-for="msg in userMessages" :key="msg.id" :class="['bubble', msg.role]">
            <a-avatar :style="{ background: msg.role === 'ai' ? '#fde3cf' : '#87d068' }">
              <UserOutlined />
            </a-avatar>
            <span class="message">{{ msg.content }}</span>
          </div>
        </div>

        <!-- 輸入區 -->
        <div class="input-area">
          <a-textarea
            v-model:value="inputMessage"
            placeholder="輸入訊息..."
            class="custom-input"
            :disabled="isStreaming"
            @keydown.enter.prevent="sendMessage"
          />
          <a-button type="primary" class="send-btn" @click="isStreaming ? abortStreaming() : sendMessage()">
            <template v-if="isStreaming">
              <CloseOutlined />
            </template>
            <template v-else>
              <SendOutlined />
            </template>
          </a-button>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { UserOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons-vue";

// 定義 Props
const props = defineProps({
  messages: { type: Array, required: true },
  sessionId: { type: String, required: true }, // 確保有 sessionId
  toolUrl: { type: String, required: true } // 🔹 新增工具的 API URL
});


// 讓 `Chat.vue` 能向 `Demo.vue` 傳遞訊息
const emit = defineEmits(["updateMessages"]);

// 建立 `userMessages` 來儲存聊天內容
const userMessages = ref([...props.messages]);

// 監聽 `props.messages`，確保對話切換時更新
watch(() => props.messages, (newMessages) => {
  userMessages.value = [...newMessages];
}, { deep: true });

// 輸入內容
const inputMessage = ref(""); 
const isStreaming = ref(false); 
const abortController = ref(null);
const chatBox = ref(null); 

// 🔹 滾動到底部
function scrollToBottom() {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight;
    }
  });
}

// 🔹 模擬 Streaming API (逐步更新單一訊息)
async function fetchStreamingResponse(userInput) {
  if (!props.toolUrl) {
    console.error("Error: Missing tool API URL");
    return;
  }

  isStreaming.value = true;
  abortController.value = new AbortController();
  const signal = abortController.value.signal;

  const aiMessage = { id: Date.now(), content: "", role: "ai" };
  userMessages.value.push(aiMessage);
  emit("updateMessages", userMessages.value);
  scrollToBottom();

  try {
    // 使用該工具的 API URL
    const response = await fetch(props.toolUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: userInput, streaming: true, chatId: props.sessionId }),
      signal,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let currentText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      const lines = chunk.split("\n").filter((line) => line.startsWith("data:"));

      for (const line of lines) {
        try {
          const jsonStr = line.replace("data:", "").trim();
          const parsed = JSON.parse(jsonStr);

          if (parsed.event === "metadata" || parsed.event === "end") {
            continue;
          }

          if (parsed.event === "token") {
            currentText += parsed.data;
            aiMessage.content = currentText;
            userMessages.value = [...userMessages.value];
            emit("updateMessages", userMessages.value);
            scrollToBottom();
          }
        } catch (err) {
          console.error("Streaming parse error:", err, "chunk:", chunk);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching streaming response:", error);
  }

  isStreaming.value = false;

  try {
    await fetch(`/api/chats/${props.sessionId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: userMessages.value }),
    });
  } catch (error) {
    console.error("Error saving AI response:", error);
  }
}




// 🔹 發送訊息
async function sendMessage() {
  if (!inputMessage.value.trim()) return;

  // 確保 `sessionId` 存在
  if (!props.sessionId) {
    console.error("Error: Missing sessionId");
    return;
  }

  // 建立新的使用者訊息
  const userMsg = { id: Date.now(), content: inputMessage.value, role: "user" };
  userMessages.value.push(userMsg);
  emit("updateMessages", userMessages.value); // 通知父組件
  scrollToBottom();

  // 取得使用者輸入
  const userInput = inputMessage.value;

  // 清空輸入框
  nextTick(() => {
    inputMessage.value = "";
  });

  try {
    // 更新後端，儲存使用者訊息
    await fetch(`/api/chats/${props.sessionId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: userMessages.value }),
    });

    // 呼叫 Flowise API 取得 AI 回應
    fetchStreamingResponse(userInput);
  } catch (error) {
    console.error("Error updating chat:", error);
  }
}




// 🔹 取消流式回應
function abortStreaming() {
  if (abortController.value) {
    abortController.value.abort();
  }
  isStreaming.value = false;
}

// 🔹 組件掛載時滾動到底部
onMounted(() => {
  scrollToBottom();
});

// 🔹 組件卸載時確保終止 Streaming
onBeforeUnmount(() => {
  abortStreaming();
});
</script>



<style scoped>
/* 聊天框 */
.chat-box {
  height: 400px;
  overflow-y: auto;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 5px;
  margin-bottom: 10px;
  scrollbar-width: none; /* 隱藏滾輪 */
}

.chat-box::-webkit-scrollbar {
  display: none; /* 隱藏滾輪 */
}

/* 對話氣泡 */
.bubble {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px; /* 設定頭像與文字間距 */
}

.bubble.ai {
  justify-content: flex-start;
}

.bubble.user {
  justify-content: flex-end;
}

.message {
  padding: 8px 12px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 60%; /* 不隨字數變寬 */
  word-break: break-word; /* 避免超出邊界 */
}

.bubble.user .message {
  background: #87d068;
  color: white;
}

/* 輸入框區 */
.input-area {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  padding: 8px;
  border-radius: 8px;
}

/* 輸入框 */
.custom-input {
  flex-grow: 1;
  height: 60px;
  overflow-y: auto;
  border-radius: 8px;
  resize: none;
  scrollbar-width: none; /* 隱藏滾輪 */
  line-height: 1.8; /* 讓輸入文字垂直置中 */
  padding-top: 15px;
}

.custom-input::-webkit-scrollbar {
  display: none; /* 隱藏滾輪 */
}

/* 送出按鈕 */
.send-btn {
  margin-left: 8px;
  background-color: #1890ff;
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover {
  background-color: #40a9ff;
}

/* 取消回應按鈕 (與送出按鈕共用 send-btn) */
.cancel-btn {
  margin-left: 8px;
  background-color: #ff4d4f;
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn:hover {
  background-color: #ff7875;
}
</style>
