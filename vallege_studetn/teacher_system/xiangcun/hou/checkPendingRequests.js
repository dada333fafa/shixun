const mongoose = require('mongoose');

async function checkPendingRequests() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const ParentChildRequest = require('./models/ParentChildRequest');

    const requests = await ParentChildRequest.find({ status: 'pending' });
    
    console.log(`📊 找到 ${requests.length} 条pending请求:\n`);
    
    requests.forEach((req, i) => {
      console.log(`${i + 1}. 请求ID: ${req._id}`);
      console.log(`   状态: ${req.status}`);
      console.log(`   家长ID: ${req.parent}`);
      console.log(`   学生ID: ${req.student}`);
      console.log(`   消息: ${req.message}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

checkPendingRequests();
