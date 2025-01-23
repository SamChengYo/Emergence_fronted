import { Tool } from '../../models/Tool';
import { connectDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  await connectDB();
  const body = await readBody(event);
  const tool = await Tool.findById(body.toolId);

  if (!tool) {
    throw createError({ statusCode: 404, message: 'Tool not found' });
  }

  const newChat = { sessionId: `chat-${tool.chats.length + 1}`, name: `對話 ${tool.chats.length + 1}`, messages: [] };
  tool.chats.push(newChat);
  await tool.save();

  return newChat;
});
