// server/api/tools.ts
import { defineEventHandler, getQuery } from 'h3';
import { connectDB } from '~/server/utils/db';
import { Tool } from '~/server/models/Tool';

export default defineEventHandler(async (event) => {
  await connectDB();
  // 從 query 中讀取 userId，如果有傳入，就做工具篩選
  const { userId } = getQuery(event);
  try {
    let tools;
    if (userId) {
      // 只回傳 users 陣列中包含該 userId 的工具
      tools = await Tool.find({ users: userId });
    } else {
      // 若沒有傳入 userId（例如管理員），則回傳所有工具
      tools = await Tool.find({});
    }
    return { success: true, tools };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});
