import { defineEventHandler, readBody } from 'h3';
import { connectDB } from '~/server/utils/db';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  await connectDB();
  const { username, email, password } = await readBody(event);

  if (!username || !email || !password) {
    return { status: 400, message: '所有欄位都是必填的' };
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { status: 400, message: '此 Email 已被註冊' };
  }

  const newUser = new User({ username, email, password });
  await newUser.save();

  return { success: true, message: '註冊成功' };
});
