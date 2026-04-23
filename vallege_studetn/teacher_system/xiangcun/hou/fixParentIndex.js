const mongoose = require('mongoose');
require('dotenv').config();

async function fixParentIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功');

    const db = mongoose.connection.db;
    const collection = db.collection('parents');

    // 获取当前索引
    const indexes = await collection.indexes();
    console.log('当前索引:', indexes);

    // 删除所有非默认索引
    for (const index of indexes) {
      if (index.name !== '_id_') {
        console.log(`删除索引: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }

    // 创建正确的唯一索引
    await collection.createIndex({ user: 1 }, { unique: true });
    console.log('✅ 已创建正确的 user 唯一索引');

    console.log('✅ 索引修复完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

fixParentIndex();
