<template>
  <div class="container">
    <a-card title="個人資料" class="profile-card centered-card">
      <div class="avatar-container">
        <a-avatar size="large" class="profile-avatar" :src="formState.avatar" />
      </div>

      <a-form :model="formState" layout="vertical">
        <!-- 使用者名稱 -->
        <a-form-item label="使用者名稱">
          <a-input v-model:value="formState.username" :disabled="isEditingDisabled" placeholder="輸入使用者名稱" />
        </a-form-item>

        <!-- 信箱 -->
        <a-form-item label="信箱">
          <a-input v-model:value="formState.email" :disabled="isEditingDisabled" placeholder="輸入信箱" />
        </a-form-item>
        <!-- 控制編輯 & 提交 -->
        <a-form-item>
          <a-button type="primary" @click="toggleEditMode">
            {{ isEditingDisabled ? '編輯資料' : '鎖定資料' }}
          </a-button>
        </a-form-item>

        <!-- 權限管理 -->
        <a-form-item label="權限管理">
          <a-select v-model:value="formState.role">
            <a-select-option value="admin">管理員</a-select-option>
            <a-select-option value="user">一般使用者</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 群組管理 -->
        <a-form-item label="群組管理">
          <a-button type="primary" @click="openGroupManagement">管理群組</a-button>
        </a-form-item>

      </a-form>
    </a-card>

    <!-- 群組管理抽屜 -->
    <a-drawer v-model:visible="isGroupManagementVisible" title="群組管理" placement="right" width="500" @close="closeGroupManagement">
      <a-list :data-source="availableGroups" bordered>
        <template #renderItem="{ item }">
          <a-list-item class="group-button">
            <a-button type="default" block @click="openGroupDetails(item)">{{ item }}</a-button>
            <a-button type="link" @click="removeGroup(item)">
              <i class="fas fa-trash"></i>
            </a-button>
          </a-list-item>
        </template>
      </a-list>
      <a-input v-model:value="newGroup" placeholder="輸入新群組名稱" style="margin-top: 10px;" />
      <a-button type="primary" block style="margin-top: 10px;" @click="addGroup">新增群組</a-button>
    </a-drawer>

    <!-- 群組詳情 Modal -->
    <a-modal v-model:visible="isGroupDetailVisible" title="群組詳情" class="group-modal" :width="800" @cancel="closeGroupDetails">
      <p>這裡是 {{ selectedGroup }} 群組的設定</p>
      <a-list :data-source="availableModels" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <span>{{ item }}</span>
            <a-button type="link" @click="removeModel(item)">
              <i class="fas fa-trash"></i>
            </a-button>
          </a-list-item>
        </template>
      </a-list>
      <a-input v-model:value="newModel" placeholder="輸入新模型名稱" style="margin-top: 10px;" />
      <a-button type="primary" block style="margin-top: 10px;" @click="addModel">新增模型</a-button>
      <a-button type="primary" block style="margin-top: 10px;" @click="closeGroupDetails">關閉</a-button>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 表單狀態
const formState = ref({
  username: 'SamCheng',
  email: 'sam.cheng@heph-ai.com',
  avatar: 'https://via.placeholder.com/100',
  role: 'admin',
});

// 是否禁用編輯
const isEditingDisabled = ref(true);

// 群組管理
const availableGroups = ref(['群組A', '群組B', '群組C']);
const newGroup = ref('');
const isGroupManagementVisible = ref(false);

// 群組詳情
const availableModels = ref(['模型1', '模型2', '模型3']);
const newModel = ref('');
const isGroupDetailVisible = ref(false);
const selectedGroup = ref('');

// 切換編輯模式
const toggleEditMode = () => {
  isEditingDisabled.value = !isEditingDisabled.value;
};

// 提交表單
const submitForm = () => {
  console.log('提交的資料:', formState.value);
  alert('提交成功！');
};

// 群組管理控制
const openGroupManagement = () => (isGroupManagementVisible.value = true);
const closeGroupManagement = () => (isGroupManagementVisible.value = false);

// 群組詳情控制
const openGroupDetails = (group) => {
  selectedGroup.value = group;
  isGroupDetailVisible.value = true;
};
const closeGroupDetails = () => (isGroupDetailVisible.value = false);
</script>

<style scoped>
/* 主要佈局 */
.container {
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 卡片樣式 */
.profile-card {
  width: 800px;
  max-width: 800px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 20px;
}

/* Avatar */
.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* 群組按鈕 */
.group-button a-button {
  transition: background-color 0.3s;
}

.group-button a-button:hover {
  background-color: #1890ff;
  color: white;
}

/* Modal 樣式 */
.group-modal {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
