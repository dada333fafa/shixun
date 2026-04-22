const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== 迁移消息数据 ===\n');
  
  try {
    const messages = await mongoose.connection.db.collection('messages').find({}).toArray();
    console.log(`找到 ${messages.length} 条消息\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const msg of messages) {
      const updateFields = {};
      
      // 迁移 sender -> senderId
      if (msg.sender && !msg.senderId) {
        updateFields.senderId = msg.sender;
      }
      
      // 迁移 receiver -> receiverId
      if (msg.receiver && !msg.receiverId) {
        updateFields.receiverId = msg.receiver;
      }
      
      // 迁移 match -> matchId
      if (msg.match && !msg.matchId) {
        updateFields.matchId = msg.match;
      }
      
      if (Object.keys(updateFields).length > 0) {
        await mongoose.connection.db.collection('messages').updateOne(
          { _id: msg._id },
          { $set: updateFields }
        );
        updated++;
        console.log(`✅ 消息 ${msg._id} 已更新`);
      } else {
        skipped++;
      }
    }
    
    console.log(`\n=== 迁移完成 ===`);
    console.log(`更新: ${updated} 条`);
    console.log(`跳过: ${skipped} 条`);
    
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}).catch(e => {
  console.error('数据库连接失败:', e);
  process.exit(1);
});
