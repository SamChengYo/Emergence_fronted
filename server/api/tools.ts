import { Tool } from '../models/Tool';
import { connectDB } from '../utils/db';

export default defineEventHandler(async () => {
  await connectDB();
  const tools = await Tool.find({});
  return tools;
});
