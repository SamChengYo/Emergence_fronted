// server/api/users.ts
import { defineEventHandler, getQuery } from 'h3';
import { connectDB } from '~/server/utils/db';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  await connectDB();
  const { limit = 10, search = '' } = getQuery(event);
  try {
    const query = search ? { username: { $regex: search, $options: 'i' } } : {};
    const users = await User.find(query).limit(Number(limit));
    return { success: true, users };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});
