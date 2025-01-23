import { Tool } from '../../models/Tool';
import { Chat } from '../../models/Chat';
import { connectDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  await connectDB();
  const { sessionId } = event.context.params;

  // 1. 刪除 `Tool` collection 裡的對話
  await Tool.updateMany({}, { $pull: { chats: { sessionId } } });

  // 2. 刪除 `Chat` collection 裡的對話
  await Chat.deleteOne({ sessionId });

  return { success: true };
});
