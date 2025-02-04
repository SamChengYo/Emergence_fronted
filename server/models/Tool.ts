// server/models/Tools.ts
import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  sessionId: String,
  name: String
}, { versionKey: false });

const ToolSchema = new mongoose.Schema({
  // 如果有自訂 id 可保留，通常 _id 就足夠
  id: String,
  name: { type: String, required: true },
  url: { type: String, required: true },
  chats: [ChatSchema],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { versionKey: false });

export const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);
