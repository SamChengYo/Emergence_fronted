import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  sessionId: String,
  name: String
}, { versionKey: false });

const ToolSchema = new mongoose.Schema({
  id: String,
  name: String,
  url: { type: String, required: true },
  chats: [ChatSchema]
}, { versionKey: false });

export const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);
