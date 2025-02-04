<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

// 表單狀態（新增 fullName 欄位）
const formState = ref({
  username: '',
  email: '',
  avatar: 'https://via.placeholder.com/100',
  role: '',
});
const isEditingDisabled = ref(true);
const user = ref(null);
const router = useRouter();

// 工具管理狀態
const availableTools = ref([]); // 從後端取得所有工具資料
const newToolName = ref('');
const newToolUrl = ref('');
const isToolManagementVisible = ref(false);

// 工具詳情狀態
const isToolDetailVisible = ref(false);
const selectedTool = ref({
  _id: '',
  name: '',
  users: [] // 工具內設定的使用者 ID 陣列
});
const selectedToolUsers = ref([]); // 在 Modal 中勾選的使用者

// 用來記錄 Modal 開啟時原始的使用者設定（作比對用）
const originalToolUsers = ref('');

// 下拉選單選項（使用者）
const availableUsersOptions = ref([]); // 格式：{ label, value }

// 切換編輯模式
const toggleEditMode = () => {
  isEditingDisabled.value = !isEditingDisabled.value;
};

// 回首頁：直接使用 router.push('/')
const goHome = () => {
  router.push('/');
};

const logoutAndRedirect = async () => {
  try {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  } catch (error) {
    console.error('登出失敗:', error.message || '未知錯誤');
  }
};

const openToolManagement = async () => {
  isToolManagementVisible.value = true;
  await loadAllTools();
};

const closeToolManagement = () => {
  isToolManagementVisible.value = false;
};

const openToolDetails = async (tool) => {
  selectedTool.value = { ...tool };
  // 將工具內的使用者設定帶入下拉選單的初始值
  selectedToolUsers.value = tool.users ? [...tool.users] : [];
  // 記錄原始值，用來比對是否有變更
  originalToolUsers.value = JSON.stringify(selectedToolUsers.value);
  // 載入可選使用者資料（預設前 10 筆，可搜尋過濾）
  await loadAvailableUsers();
  isToolDetailVisible.value = true;
};

const closeToolDetails = () => {
  isToolDetailVisible.value = false;
};

// OK 按鈕：若有變更則更新工具設定，否則僅關閉 Modal
const okToolSettings = async () => {
  // 比對原始值與當前選擇
  if (JSON.stringify(selectedToolUsers.value) !== originalToolUsers.value) {
    // 有變更，呼叫更新工具設定
    try {
      const result = await $fetch(`/api/tools/${selectedTool.value._id}`, {
        method: 'PUT',
        body: {
          users: selectedToolUsers.value, // 傳入使用者 ID 陣列
        },
      });
      if (result.success) {
        // 更新 availableTools 中該工具的設定
        const index = availableTools.value.findIndex(
          (t) => t._id === selectedTool.value._id
        );
        if (index !== -1) {
          availableTools.value[index].users = selectedToolUsers.value;
        }
        console.log('工具設定更新成功');
      } else {
        alert(result.message || '更新工具設定失敗');
      }
    } catch (error) {
      console.error('更新工具設定錯誤:', error);
      alert('更新工具設定發生錯誤');
    }
  }
  // 無論有無變更，按 OK 都關閉 Modal
  closeToolDetails();
};

// 新增工具：呼叫後端 API 新增工具（使用 /api/select_tools 這個 API）
const addTool = async () => {
  if (!newToolName.value.trim() || !newToolUrl.value.trim()) {
    alert('請輸入工具名稱及 URL');
    return;
  }
  try {
    const result = await $fetch('/api/select_tools', {
      method: 'POST',
      body: {
        toolName: newToolName.value,
        toolUrl: newToolUrl.value,
      },
    });
    if (result.success) {
      availableTools.value.push({
        _id: result.toolId,
        name: newToolName.value,
        url: newToolUrl.value,
        users: [],
      });
      newToolName.value = '';
      newToolUrl.value = '';
      console.log('工具新增成功');
    } else {
      alert(result.message || '新增工具失敗');
    }
  } catch (error) {
    console.error('新增工具錯誤:', error);
    alert('新增工具發生錯誤');
  }
};

// 刪除指定工具
const deleteTool = async (tool) => {
  if (!confirm(`確定要刪除工具 ${tool.name} 嗎？`)) return;
  try {
    const result = await $fetch(`/api/tools/${tool._id}`, {
      method: 'DELETE',
    });
    if (result.success) {
      availableTools.value = availableTools.value.filter(
        (t) => t._id !== tool._id
      );
      console.log('工具已刪除');
    } else {
      alert(result.message || '刪除工具失敗');
    }
  } catch (error) {
    console.error('刪除工具錯誤:', error);
    alert('刪除工具發生錯誤');
  }
};

// 載入所有工具資料（從 API 撈取）— 使用 /api/select_tools 的 GET 方法
const loadAllTools = async () => {
  try {
    const result = await $fetch('/api/select_tools', { method: 'GET' });
    if (result.success) {
      availableTools.value = result.tools.map((tool) => ({
        ...tool,
        _id: tool._id.toString(),
        users: tool.users || [],
      }));
    }
  } catch (error) {
    console.error('載入工具錯誤:', error);
  }
};

// 載入可選使用者資料（從 API 撈取前 10 筆，可依搜尋條件過濾）
const loadAvailableUsers = async (search = '') => {
  try {
    const result = await $fetch('/api/users', {
      method: 'GET',
      query: { limit: 10, search },
    });
    if (result.success) {
      availableUsersOptions.value = result.users.map((u) => ({
        label: u.username,
        value: u._id,
      }));
    }
  } catch (error) {
    console.error('載入使用者錯誤:', error);
  }
};

const onUserSearch = async (value) => {
  await loadAvailableUsers(value);
};

onMounted(async () => {
  try {
    // 透過 /api/auth/me 取得使用者資料
    const response = await $fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
    if (response.success) {
      user.value = response.user;
      formState.value.username = response.user.username;
      formState.value.fullName = response.user.fullName || ''; // 假設後端回傳 fullName
      formState.value.email = response.user.email;
      formState.value.role = response.user.auth === 0 ? 'admin' : 'user';
      formState.value.avatar = response.user.avatar || formState.value.avatar;
    } else {
      console.warn('登入狀態失效:', response.message);
      await logoutAndRedirect();
    }
  } catch (error) {
    console.error(
      '登入狀態檢查失敗:',
      error.message || '未知錯誤'
    );
    await logoutAndRedirect();
  }
});
</script>

<template>
  <div class="container">
    <!-- 回首頁按鈕，放在頁面上方 -->
    <div class="back-home">
      <a-button type="default" @click="goHome">
        回首頁
      </a-button>
    </div>

    <a-card title="個人資料" class="profile-card centered-card">
      <div class="avatar-container">
        <a-avatar size="large" class="profile-avatar" :src="formState.avatar" />
      </div>
      <a-form :model="formState" layout="vertical">
        <!-- 使用者名稱 -->
        <a-form-item label="使用者名稱">
          <a-input
            v-model:value="formState.username"
            :disabled="isEditingDisabled"
            placeholder="輸入使用者名稱"
          />
        </a-form-item>
        <!-- 信箱 -->
        <a-form-item label="信箱">
          <a-input
            v-model:value="formState.email"
            :disabled="isEditingDisabled"
            placeholder="輸入信箱"
          />
        </a-form-item>
        <!-- 權限管理 -->
        <a-form-item label="權限管理">
          <a-select v-model:value="formState.role" :disabled="isEditingDisabled">
            <a-select-option value="admin">管理員</a-select-option>
            <a-select-option value="user">一般使用者</a-select-option>
          </a-select>
        </a-form-item>
        <!-- 控制編輯 & 提交 -->
        <a-form-item>
          <a-button type="primary" @click="toggleEditMode">
            {{ isEditingDisabled ? '編輯資料' : '鎖定資料' }}
          </a-button>
        </a-form-item>
        <!-- 管理工具 -->
        <a-form-item label="管理工具" v-if="formState.role === 'admin'">
          <a-button type="primary" @click="openToolManagement">管理工具</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 工具管理抽屜 -->
    <a-drawer
      v-model:visible="isToolManagementVisible"
      title="管理工具"
      placement="right"
      width="500"
      @close="closeToolManagement"
    >
      <a-list :data-source="availableTools" bordered>
        <template #renderItem="{ item }">
          <a-list-item class="tool-button">
            <a-button type="default" block @click="openToolDetails(item)">
              {{ item.name }}
            </a-button>
            <a-button type="link" @click="deleteTool(item)">
              <i class="fas fa-trash"></i>
            </a-button>
          </a-list-item>
        </template>
      </a-list>
      <!-- 新增工具區塊 -->
      <a-input
        v-model:value="newToolName"
        placeholder="輸入新工具名稱"
        style="margin-top: 10px;"
      />
      <a-input
        v-model:value="newToolUrl"
        placeholder="輸入工具 URL"
        style="margin-top: 10px;"
      />
      <a-button type="primary" block style="margin-top: 10px;" @click="addTool">
        新增工具
      </a-button>
    </a-drawer>

    <!-- 工具詳情 Modal -->
    <a-modal
      v-model:visible="isToolDetailVisible"
      title="工具詳情"
      class="tool-modal"
      :width="800"
      @cancel="closeToolDetails"
      @ok="okToolSettings"
    >
      <div class="tool-details-content">
        <p>設定工具：{{ selectedTool.name }}</p>
        <!-- 選擇要加入工具的使用者 -->
        <div class="tool-section">
          <h3>選擇使用者</h3>
          <a-select
            v-model:value="selectedToolUsers"
            mode="multiple"
            style="width: 100%;"
            placeholder="選擇使用者"
            :options="availableUsersOptions"
            show-search
            filter-option
            @search="onUserSearch"
          />
        </div>

      </div>
    </a-modal>
  </div>
</template>

<style scoped>
/* 基本版型 */
.container {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}
.back-home {
  align-self: flex-start;
  margin-bottom: 10px;
}
.profile-card {
  width: 800px;
  max-width: 800px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 20px;
}
.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.tool-button a-button {
  transition: background-color 0.3s;
}
.tool-button a-button:hover {
  background-color: #1890ff;
  color: white;
}

/* 管理工具區塊樣式 */
.tool-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tool-details-content {
  width: 100%;
}
.tool-section {
  margin-bottom: 15px;
}
</style>
