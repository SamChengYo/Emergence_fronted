<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  UserAddOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  LogoutOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import Chat from '@/components/Chat.vue';
import { set } from 'mongoose';

const selectedKeys = ref<string[]>([]);
const collapsed = ref<boolean>(false);
const tools = ref<{ id: string, name: string, chats: { sessionId: string, name: string }[] }[]>([]);
const selectedChat = ref<{ sessionId: string, name: string, messages: any[] } | null>(null);
const isLoading = ref<boolean>(false);
const router = useRouter();
const selectedToolUrl = ref<string | null>(null);
const user = ref(null);
const isloging = ref(false);

const loadTools = async () => {
  try {
    // 如果使用者不是管理員（例如 auth !== 0），則只取該使用者可用的工具
    let url = '/api/tools';
    // user.value && user.value.auth !== 0
    if (user.value) {
      url += `?userId=${user.value._id}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (data.success) {
      tools.value = data.tools.map(tool => ({
        ...tool,
        _id: tool._id.toString(),  // 確保 _id 為字串
        users: tool.users || [],
      }));
    } else {
      console.error('API Error:', data.message);
    }
  } catch (error) {
    console.error('Error loading tools:', error);
  }
};


const selectChat = async (sessionId: string) => {
  if (selectedKeys.value[0] === sessionId) return;
  selectedKeys.value = [sessionId];
  isLoading.value = true;

  try {
    const response = await fetch(`/api/chats/${sessionId}`);
    selectedChat.value = await response.json();

    // 🔹 找到該 `sessionId` 所屬的工具，並取出 `toolUrl`
    const tool = tools.value.find(t => t.chats.some(c => c.sessionId === sessionId));
    selectedToolUrl.value = tool ? tool.url : null;

  } catch (error) {
    console.error('Error loading chat:', error);
  } finally {
    isLoading.value = false;
  }
};

const addChat = async (toolId: string) => {
  try {
    // 1. 讓 API 創建新對話
    const chatResponse = await fetch('/api/chats/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId })
    });

    if (!chatResponse.ok) throw new Error('Failed to create chat');

    const newChat = await chatResponse.json();

    // 2. 在前端同步更新 tools 陣列
    const tool = tools.value.find(t => t.id === toolId);
    if (tool) {
      tool.chats.push({ sessionId: newChat.sessionId, name: newChat.name });

      // 3. 直接選擇新建立的聊天
      selectChat(newChat.sessionId);
    }
  } catch (error) {
    console.error('Error adding chat:', error);
  }
};



const deleteChat = async (toolId: string, chatId: string) => {
  try {
    // 1. 讓 API 刪除該聊天
    const deleteResponse = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });

    if (!deleteResponse.ok) throw new Error('Failed to delete chat');

    // 2. 更新前端 tools 陣列
    const tool = tools.value.find(t => t.id === toolId);
    if (tool) {
      tool.chats = tool.chats.filter(chat => chat.sessionId !== chatId);

      // 3. 若當前選中的聊天被刪除，則重置選擇
      if (selectedKeys.value[0] === chatId) {
        selectedKeys.value = [];
        selectedChat.value = null;
      }
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
};


const updateMessages = (updatedMessages) => {
  if (selectedChat.value) {
    selectedChat.value.messages = updatedMessages;
  }
};


const logoutAndRedirect = async () => {
  try {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include' // 確保 Cookie 被刪除
    });

    router.push('/login');
  } catch (error: any) {
    alert('登出失敗: ' + (error.message || '未知錯誤'));
  }
};


const handleMenuClick = async ({ key }: { key: string }) => {
  if (key === 'settings') {
    router.push('/setting');
  } else if (key === 'logout') {
    await logoutAndRedirect();
  }
};


onMounted(async () => {
  try {
    // 透過後端 `/api/auth/me` 來檢查 `auth_token`
    const response = await $fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // 確保發送 Cookie
    });

    if (response.success) {
      user.value = response.user;
      console.log('當前使用者資訊:', response.user);
      
      isloging.value = true;

      // **確認登入後再載入工具**
      await loadTools();
    } else {
      console.warn('登入狀態失效:', response.message);
      await logoutAndRedirect();
      router.push('/login');
    }
  } catch (error: any) {
    console.error('登入狀態檢查失敗:', error.message || '未知錯誤');
    await logoutAndRedirect();
    router.push('/login');
  }
});

</script>

<template>
  <a-layout v-if="isloging">
    <!-- 側邊欄 -->
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible :style="{ height: '100vh' }">
      <div class="logo"><br></div>
      <div class="title" v-if="!collapsed">Emergence</div>
      <hr class="divider" v-if="!collapsed" />

      <!-- 動態選單 -->
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-sub-menu v-for="tool in tools" :key="tool.id">
          <template #title>
            <span>
              <UserAddOutlined />
              <span v-if="!collapsed">{{ tool.name }}</span>
            </span>
          </template>

          <!-- 新增對話按鈕 -->
          <a-menu-item :key="`addChat-${tool.id}`" @click="addChat(tool.id)">
            <UserAddOutlined />
            <span v-if="!collapsed">新增對話</span>
          </a-menu-item>

          <!-- 動態對話列表 -->
          <a-menu-item v-for="item in tool.chats" :key="item.sessionId" @click="selectChat(item.sessionId)">
            <UserAddOutlined />
            <span v-if="!collapsed">{{ item.name }}</span>
            <DeleteOutlined class="delete-icon" @click.stop="deleteChat(tool.id, item.sessionId)" />
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- 頂部導航欄 -->
      <a-layout-header style="background: #fff; padding: 0" class="header">
        <menu-unfold-outlined v-if="collapsed" class="trigger" @click="() => (collapsed = !collapsed)" />
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />

        <!-- 使用者選單 -->
        <a-dropdown :trigger="['click']">
          <a-avatar size="large" class="profile-avatar" src="https://via.placeholder.com/40" />
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="settings">
                <setting-outlined /> 設定
              </a-menu-item>
              <a-menu-item key="logout">
                <logout-outlined /> 登出
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-layout-header>

      <!-- 內容區域 -->
      <div style="margin-top: 100px; text-align: center;">
        <a-spin v-if="isLoading" size="large" />
        <Chat
          v-else-if="selectedChat"
          :key="selectedChat.sessionId"
          :messages="selectedChat.messages"
          :sessionId="selectedChat.sessionId"
          :toolUrl="selectedToolUrl"
          @updateMessages="updateMessages"
        />

      </div>
    </a-layout>
  </a-layout>
  <div v-else class="loading-container">
    <div class="spinner"></div>
  </div>
</template>

<style>
.header {
  background: #fff;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trigger {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 5px;
}

.trigger:hover {
  color: #1890ff;
}

.profile-avatar {
  cursor: pointer;
  margin-right: 20px;
}

.title {
  color: white;
  font-size: 20px;
  text-align: center;
  margin: 20px 0;
}

.delete-icon {
  float: right;
  margin-right: 15px;
  margin-top: 13.5px;
  cursor: pointer;
  transition: color 0.3s;
}

.delete-icon:hover {
  color: darkred;
}

.divider {
  border: none;
  height: 2px;
  background-color: white;
  margin: 20px 16px;
}

.site-layout .site-layout-background {
  background: #fff;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff; /* 可根據需求調整背景色 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* spinner 樣式 */
.spinner {
  border: 8px solid #f3f3f3;       /* 淺灰色邊框 */
  border-top: 8px solid #3498db;     /* 藍色邊框 */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}

/* 轉動動畫 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
