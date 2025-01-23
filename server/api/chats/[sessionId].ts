import { Chat } from '../../models/Chat';
import { connectDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  await connectDB();
  const { sessionId } = event.context.params;
  return await Chat.findOne({ sessionId });
});
