const mongoose = require('mongoose');

async function checkMessages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功\n');
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      name: String,
      role: String
    }, { timestamps: true }));
    
    const Message = mongoose.model('Message', new mongoose.Schema({
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String
    }, { timestamps: true }));
    
    // 获取所有消息
    const messages = await Message.find({}).populate('sender', 'username name').populate('receiver', 'username name');
    
    console.log(`========== 数据库中的消息 (${messages.length}条) ==========\n`);
    
    messages.forEach((msg, index) => {
      console.log(`消息 ${index + 1}:`);
      console.log(`  发送者 (sender): ${msg.sender ? msg.sender.username : 'null'} (${msg.sender ? msg.sender.name : ''})`);
      console.log(`  接收者 (receiver): ${msg.receiver ? msg.receiver.username : 'null'} (${msg.receiver ? msg.receiver.name : ''})`);
      console.log(`  内容: ${msg.content}`);
      console.log(`  时间: ${msg.createdAt}`);
      console.log('');
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

checkMessages();
