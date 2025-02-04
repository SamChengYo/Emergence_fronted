import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  name: { type: String, required: true },
  messages: { type: Array, default: [] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { versionKey: false });

export const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
