import { defineEventHandler, readBody } from 'h3';
import { connectDB } from '~/server/utils/db';
import User from '~/server/models/User';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  await connectDB();
  const { email, password } = await readBody(event);

  if (!email || !password) {
    return { status: 400, message: '請輸入 Email 和密碼' };
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return { status: 400, message: '帳號或密碼錯誤' };
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { success: true, token, message: '登入成功' };
});
