const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 连接到用户指定的MongoDB数据库
    const conn = await mongoose.connect('mongodb://localhost:27017/rural_education_platform', {
      // 移除废弃的选项
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.db.databaseName}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;