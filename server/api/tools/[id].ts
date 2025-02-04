// server/api/tools/[id].ts
import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { connectDB } from '~/server/utils/db';
import { Tool } from '~/server/models/Tool';

export default defineEventHandler(async (event) => {
  await connectDB();
  const id = getRouterParam(event, 'id');
  const method = event.req.method?.toUpperCase();

  if (method === 'DELETE') {
    try {
      await Tool.findByIdAndDelete(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  } else if (method === 'PUT') {
    // 更新工具設定，預期 body 格式： { users: [userId, ...] }
    const body = await readBody(event);
    const { users } = body;
    try {
      const updatedTool = await Tool.findByIdAndUpdate(id, { users }, { new: true });
      return { success: true, tool: updatedTool };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  } else {
    event.res.statusCode = 405;
    return { success: false, message: 'Method not allowed' };
  }
});
