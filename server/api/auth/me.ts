import { defineEventHandler, getCookie } from 'h3';
import jwt from 'jsonwebtoken';
import { useRuntimeConfig } from '#imports';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = getCookie(event, 'auth_token');

  if (!token) {
    return { status: 401, message: '未登入' };
  }

  try {
    // 解碼 JWT 取得 userId
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password'); // 查詢使用者資訊 (不回傳密碼)

    if (!user) {
      return { status: 404, message: '使用者不存在' };
    }

    return { success: true, user };
  } catch (error) {
    return { status: 401, message: '無效的 Token' };
  }
});
