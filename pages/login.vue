<template>
    <a-layout class="layout">
      <a-layout-content :style="styles.section">
        <div :style="styles.container">
          <div :style="styles.header">
            <!-- 替換 Logo -->
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
  
          <!-- 表單 -->
          <a-form layout="vertical" required-mark="optional" @finish="onFinish" :model="form">
            <!-- Email -->
            <a-form-item name="email" :rules="[{ required: true, type: 'email', message: '請輸入您的 Email!' }]">
              <a-input v-model:value="form.email" placeholder="Email">
                <template #prefix>
                  <MailOutlined />
                </template>
              </a-input>
            </a-form-item>
  
            <!-- Password -->
            <a-form-item v-if="formMode !== 'forgot'" name="password" :rules="[{ required: true, message: '請輸入您的密碼!' }]">
              <a-input-password v-model:value="form.password" placeholder="Password">
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>
  
            <!-- 忘記密碼 -->
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
  
  <script setup>
  import { ref, computed } from 'vue';
  import { MailOutlined, LockOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons-vue';
  import { useBreakpoints } from '@vueuse/core';
  
  // 響應式設計
  const breakpoints = useBreakpoints({
    sm: 640,
    md: 768,
    lg: 1024,
  });
  
  // 頁面模式 (login / signup / forgot)
  const formMode = ref('login');
  
  // 表單數據
  const form = ref({
    username: '',
    email: '',
    password: '',
    verificationCode: '',
    remember: true,
  });
  
  // 提交表單
  const onFinish = (values) => {
    console.log('表單提交:', values, '模式:', formMode.value);
  };
  
  // 動態樣式
  const styles = computed(() => ({
    container: {
      margin: '0 auto',
      padding: breakpoints.md.value ? '40px' : '80px 16px',
      width: '380px',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      width: '100%',
    },
    forgotPassword: {
      float: 'right',
      cursor: 'pointer',
      color: '#1890FF',
    },
    header: {
      marginBottom: '32px',
      textAlign: 'center',
    },
    section: {
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      height: breakpoints.sm.value ? '100vh' : 'auto',
      padding: breakpoints.md.value ? '80px 0px' : '0px',
    },
    text: {
      color: '#8c8c8c',
    },
    title: {
      fontSize: breakpoints.md.value ? '24px' : '20px',
    },
    logo: {
      width: '100px',
      marginBottom: '16px',
    },
  }));
  </script>
  
  <style scoped>
  .layout {
    min-height: 100vh;
  }
  </style>
  