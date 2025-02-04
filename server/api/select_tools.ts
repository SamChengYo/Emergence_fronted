// server/api/tools.ts
import { defineEventHandler, getQuery, readBody } from 'h3';
import { connectDB } from '~/server/utils/db';
import { Tool } from '~/server/models/Tool';

export default defineEventHandler(async (event) => {
  await connectDB();
  const method = event.req.method?.toUpperCase();

  if (method === 'GET') {
    // 讀取所有工具，這裡不加限制，可依需求加分頁、排序等
    try {
      const tools = await Tool.find({});
      return { success: true, tools };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  } else if (method === 'POST') {
    // 新增工具，預期 body 格式： { toolName, toolUrl }
    const body = await readBody(event);
    const { toolName, toolUrl } = body;
    if (!toolName || !toolUrl) {
      return { success: false, message: '缺少必要參數' };
    }
    try {
      const newTool = new Tool({ name: toolName, url: toolUrl, users: [] });
      const savedTool = await newTool.save();
      return { success: true, tool: savedTool, toolId: savedTool._id };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  } else {
    event.res.statusCode = 405;
    return { success: false, message: 'Method not allowed' };
  }
});
