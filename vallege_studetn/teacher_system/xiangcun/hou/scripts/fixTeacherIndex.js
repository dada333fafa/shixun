const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== 修复 Teachers 集合索引 ===\n');
  
  try {
    const coll = mongoose.connection.db.collection('teachers');
    
    // 1. 查看所有索引
    const indexes = await coll.indexes();
    console.log('当前索引:');
    indexes.forEach(idx => console.log('  -', idx.name, JSON.stringify(idx.key)));
    
    // 2. 删除旧的 userId_1 索引
    try {
      await coll.dropIndex('userId_1');
      console.log('\n✅ 已删除旧索引: userId_1');
    } catch (e) {
      console.log('\n⚠️ 索引 userId_1 不存在或已删除');
    }
    
    // 3. 清理无效数据（user 字段为 null 或不存在的记录）
    const nullRecords = await coll.find({ 
      $or: [{ user: null }, { user: { $exists: false } }] 
    }).toArray();
    
    if (nullRecords.length > 0) {
      console.log(`\n🗑️ 发现 ${nullRecords.length} 条无效记录，正在删除...`);
      const result = await coll.deleteMany({ 
        $or: [{ user: null }, { user: { $exists: false } }] 
      });
      console.log(`✅ 已删除 ${result.deletedCount} 条无效记录`);
    } else {
      console.log('\n✅ 没有无效记录');
    }
    
    // 4. 重命名旧字段 userId -> user
    const oldFieldRecords = await coll.find({ userId: { $exists: true } }).toArray();
    if (oldFieldRecords.length > 0) {
      console.log(`\n🔄 发现 ${oldFieldRecords.length} 条使用旧字段 userId 的记录，正在迁移...`);
      for (const record of oldFieldRecords) {
        await coll.updateOne(
          { _id: record._id },
          { $set: { user: record.userId }, $unset: { userId: '' } }
        );
      }
      console.log('✅ 字段迁移完成');
    }
    
    // 5. 验证结果
    const remaining = await coll.countDocuments();
    const withUser = await coll.countDocuments({ user: { $exists: true, $ne: null } });
    console.log(`\n=== 修复完成 ===`);
    console.log(`总记录数: ${remaining}`);
    console.log(`有效记录数: ${withUser}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}).catch(e => {
  console.error('❌ 数据库连接失败:', e);
  process.exit(1);
});
