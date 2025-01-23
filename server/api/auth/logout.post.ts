import { defineEventHandler, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // 立即過期
  });

  return { success: true, message: '登出成功' };
});
