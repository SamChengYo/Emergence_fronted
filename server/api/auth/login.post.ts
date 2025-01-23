import { defineEventHandler, readBody, setCookie } from 'h3';
import { connectDB } from '~/server/utils/db';
import User from '~/server/models/User';
import jwt from 'jsonwebtoken';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  await connectDB();
  const config = useRuntimeConfig(); // 使用 Nuxt 3 的 runtimeConfig

  const { email, password } = await readBody(event);
  if (!email || !password) {
    return { status: 400, message: '請輸入 Email 和密碼' };
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return { status: 400, message: '帳號或密碼錯誤' };
  }

  if (!config.jwtSecret) {
    console.error('JWT_SECRET 未設定');
    return { status: 500, message: '伺服器錯誤，缺少 JWT_SECRET' };
  }

  // 產生 JWT Token，30 天有效期
  const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '30d' });

  // 設定 httpOnly Cookie，讓 Token 30 天後過期
  setCookie(event, 'auth_token', token, {
    httpOnly: true,  // 前端無法存取，防止 XSS 攻擊
    secure: process.env.NODE_ENV === 'production', // 僅在 HTTPS 上使用
    sameSite: 'strict', // 防止跨站請求
    maxAge: 60 * 60 * 24 * 30 // 30 天
  });

  return { success: true, message: '登入成功' };
});
