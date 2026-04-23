const mongoose = require('mongoose');

async function checkRecentMessages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const Message = require('./models/Message');
    const User = require('./models/User');

    // 获取最近20条消息
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    console.log('💬 最近的消息记录:\n');
    messages.forEach((m, i) => {
      console.log(`${i + 1}. From: ${m.senderId?.name || m.senderId} (${m.senderId})`);
      console.log(`   To: ${m.receiverId?.name || m.receiverId} (${m.receiverId})`);
      console.log(`   Content: ${m.content}`);
      console.log(`   Time: ${m.createdAt}`);
      console.log(`   MatchId: ${m.matchId || '无'}`);
      console.log('');
    });

    // 检查"我是老师"的userId
    const teacher = await User.findOne({ name: '我是老师' });
    console.log('\n👨‍🏫 老师信息:');
    console.log(`  Name: ${teacher.name}`);
    console.log(`  UserID: ${teacher._id}`);

    // 检查家长信息
    const parents = await User.find({ role: 'parent' });
    console.log('\n👨‍👩‍‍👦 家长信息:');
    parents.forEach(p => {
      console.log(`  Name: ${p.name}, UserID: ${p._id}`);
    });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

checkRecentMessages();
