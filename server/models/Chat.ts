import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  sessionId: String,
  name: String,
  messages: Array
}, { versionKey: false });

export const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
