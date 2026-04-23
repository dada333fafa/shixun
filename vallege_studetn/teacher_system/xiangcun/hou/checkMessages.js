// 查看消息记录
const mongoose = require('mongoose');

async function checkMessages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功');
    
    const Message = require('./models/Message');
    const User = require('./models/User');
    
    // 获取所有消息
    const messages = await Message.find()
      .populate('senderId', 'username name')
      .populate('receiverId', 'username name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`\n📋 最近的消息记录 (${messages.length} 条):`);
    messages.forEach((msg, index) => {
      console.log(`\n${index + 1}. 消息ID: ${msg._id}`);
      console.log(`   发送者: ${msg.senderId?.username || '未知'} (${msg.senderId?.name || ''})`);
      console.log(`   接收者: ${msg.receiverId?.username || '未知'} (${msg.receiverId?.name || ''})`);
      console.log(`   内容: ${msg.content}`);
      console.log(`   时间: ${msg.createdAt}`);
      console.log(`   状态: ${msg.status}`);
    });
    
    // 统计消息总数
    const total = await Message.countDocuments();
    console.log(`\n📊 消息总数: ${total}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

checkMessages();
