import { Chat } from '../../models/Chat';
import { Tool } from '../../models/Tool';
import { connectDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  await connectDB();
  const body = await readBody(event);

  // 使用 `id`（字串），而不是 `_id`（ObjectId）
  const tool = await Tool.findOne({ id: body.toolId });
  if (!tool) {
    throw createError({ statusCode: 404, message: 'Tool not found' });
  }

  // 產生新的 sessionId
  const sessionId = `chat-${Date.now()}`;
  const newChat = {
    sessionId,
    name: "新對話"
  };

  // 1. 將新對話存入 `Chat` collection
  await Chat.create(newChat);

  // 2. 在 Tool 的 `chats` 陣列內加入 `sessionId`
  tool.chats.push({ sessionId, name: "新對話" });
  await tool.save();

  return newChat;
});
