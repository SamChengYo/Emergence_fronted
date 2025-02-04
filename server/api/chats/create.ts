// /api/chats/create.ts
import { Chat } from '../../models/Chat';
import { Tool } from '../../models/Tool';
import { connectDB } from '../../utils/db';
import { getCookie } from 'h3';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  await connectDB();
  const config = useRuntimeConfig();

  // 從 Cookie 中取得 token，請確保前端在登入後有把 token 儲存到 Cookie 中（名稱：auth_token）
  const token = getCookie(event, 'auth_token');
  if (!token) {
    throw createError({ statusCode: 401, message: 'No auth token provided' });
  }

  // 驗證 token，並取得 userId
  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
  } catch (error) {
    throw createError({ statusCode: 401, message: 'Invalid token' });
  }

  // 根據 token 中的 userId 查詢使用者（排除 password 欄位）
  const user = await User.findById(decoded.userId).select('-password');
  if (!user) {
    throw createError({ statusCode: 401, message: 'User not found' });
  }
  // 將 user 附加到 context 中，後續其他 API 也可使用
  event.context.user = user;

  // 讀取請求的 body 資料，預期包含 toolId
  const body = await readBody(event);
  // 根據傳入的 toolId 查找工具（注意這裡是依據工具資料中的 id 欄位）
  const tool = await Tool.findOne({ id: body.toolId });
  if (!tool) {
    throw createError({ statusCode: 404, message: 'Tool not found' });
  }

  // 產生新的 sessionId
  const sessionId = `chat-${Date.now()}`;
  // 建立新的對話，並附上 userId
  const newChat = {
    sessionId,
    name: "新對話",
    userId: user._id,
  };

  // 寫入 Chat collection
  await Chat.create(newChat);

  // 若需要，也可在 Tool 的 chats 陣列中記錄這筆對話
  tool.chats.push({ sessionId, name: "新對話", userId: user._id });
  await tool.save();

  return newChat;
});
