import { Chat } from '../../../models/Chat';
import { connectDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  await connectDB();
  const { sessionId } = event.context.params;
  const body = await readBody(event);

  if (!body.messages) {
    return { statusCode: 400, message: "Messages array is required" };
  }

  try {
    // 更新 chats collection 中的該對話
    const chat = await Chat.findOneAndUpdate(
      { sessionId },
      { $set: { messages: body.messages } },
      { new: true }
    );

    if (!chat) {
      throw createError({ statusCode: 404, message: "Chat not found" });
    }

    return chat;
  } catch (error) {
    return { statusCode: 500, message: "Failed to update chat", error };
  }
});
