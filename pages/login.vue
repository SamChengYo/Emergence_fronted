<template>
  <a-layout class="layout">
    <a-layout-content :style="styles.section">
      <div :style="styles.container">
        <div :style="styles.header">
          <img src="/agatha.png" alt="Agatha Logo" :style="styles.logo" />
          <a-typography-title :style="styles.title">
            {{ formMode === 'login' ? 'Sign in' : formMode === 'signup' ? 'Sign up' : 'Forgot Password' }}
          </a-typography-title>
          <a-typography-text :style="styles.text">
            {{ formMode === 'login' 
              ? '歡迎使用 Agatha! 請先登入 !'
              : formMode === 'signup'
              ? '創建一個新帳戶'
              : '請輸入您的電子郵件以重置密碼' }}
          </a-typography-text>
        </div>

        <a-form layout="vertical" required-mark="optional" @finish="onFinish" :model="form">
          <a-form-item v-if="formMode === 'signup'" name="username" 
            :rules="[{ required: true, message: '請輸入您的使用者名稱!' }]">
            <a-input v-model:value="form.username" placeholder="Username">
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="email" :rules="[{ required: true, type: 'email', message: '請輸入您的 Email!' }]">
            <a-input v-model:value="form.email" placeholder="Email">
              <template #prefix>
                <MailOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item v-if="formMode !== 'forgot'" name="password" :rules="[{ required: true, message: '請輸入您的密碼!' }]">
            <a-input-password v-model:value="form.password" placeholder="Password">
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item v-if="formMode === 'login'">
            <a-checkbox v-model:checked="form.remember">記住我</a-checkbox>
            <a @click="formMode = 'forgot'" :style="styles.forgotPassword">忘記密碼?</a>
          </a-form-item>

          <a-form-item style="margin-bottom: 0;">
            <a-button type="primary" html-type="submit" block>
              {{ formMode === 'login' ? 'Log in' : formMode === 'signup' ? 'Sign up' : 'Reset Password' }}
            </a-button>

            <div :style="styles.footer">
              <a-typography-text :style="styles.text">
                {{ formMode === 'login' ? "還沒有帳戶嗎?" : '已經有帳戶了?' }}
              </a-typography-text>
              <a-typography-link v-if="formMode === 'login'" @click="formMode = 'signup'"> 立即註冊</a-typography-link>
              <a-typography-link v-if="formMode === 'signup' || formMode === 'forgot'" @click="formMode = 'login'">Sign in</a-typography-link>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { $fetch } from 'ofetch';

const router = useRouter();
const formMode = ref<'login' | 'signup' | 'forgot'>('login');
const form = ref<{ username?: string; email: string; password: string; remember: boolean }>({ email: '', password: '', remember: true });

const onFinish = async () => {
  try {
    if (formMode.value === 'signup') {
      const response = await $fetch<{ success: boolean; message: string }>('/api/auth/register', {
        method: 'POST',
        body: form.value
      });
      alert(response.message);
      if (response.success) formMode.value = 'login';
    } else if (formMode.value === 'login') {
      const response = await $fetch<{ success: boolean; message: string; token?: string }>('/api/auth/login', {
        method: 'POST',
        body: form.value
      });
      if (response.success) {
        // alert(response.message);
        if (response.token) localStorage.setItem('token', response.token);
        router.push('/');
      }
    }
  } catch (error: any) {
    alert('請求失敗: ' + (error.message || '未知錯誤'));
  }
};

const styles = computed(() => ({
  container: { margin: '0 auto', padding: '40px', width: '380px' },
  footer: { marginTop: '24px', textAlign: 'center', width: '100%' },
  forgotPassword: { float: 'right', cursor: 'pointer', color: '#1890FF' },
  header: { marginBottom: '32px', textAlign: 'center' },
  section: { alignItems: 'center', backgroundColor: '#f5f5f5', display: 'flex', height: '100vh', padding: '80px 0px' },
  text: { color: '#8c8c8c' },
  title: { fontSize: '24px' },
  logo: { width: '100px', marginBottom: '16px' },
}));
</script>

<style scoped>
.layout { min-height: 100vh; }
</style>
