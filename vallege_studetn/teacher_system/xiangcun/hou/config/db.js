const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_education_platform';
    console.log('正在连接 MongoDB...', mongoURI);
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`📦 数据库: ${conn.connection.db.databaseName}`);
  } catch (error) {
    console.error(`❌ MongoDB 连接失败: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
