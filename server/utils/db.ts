import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/Demo_fronted';

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 連接成功！');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
  }
};
