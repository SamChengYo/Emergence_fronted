// /api/chats/[sessionId].ts
import { Chat } from '../../models/Chat';
import { connectDB } from '../../utils/db';
import { getCookie } from 'h3';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  await connectDB();
  const config = useRuntimeConfig();

  // 從 Cookie 讀取 token
  const token = getCookie(event, 'auth_token');
  if (!token) {
    throw createError({ statusCode: 401, message: 'No auth token provided' });
  }

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
  } catch (error) {
    throw createError({ statusCode: 401, message: 'Invalid token' });
  }

  const user = await User.findById(decoded.userId).select('-password');
  if (!user) {
    throw createError({ statusCode: 401, message: 'User not found' });
  }
  event.context.user = user;

  // 從路由參數取得 sessionId
  const { sessionId } = event.context.params;
  // 僅查詢屬於該使用者的對話
  const chat = await Chat.findOne({ sessionId, userId: user._id });
  if (!chat) {
    throw createError({ statusCode: 404, message: 'Chat not found' });
  }
  return chat;
});
