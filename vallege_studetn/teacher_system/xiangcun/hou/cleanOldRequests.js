const mongoose = require('mongoose');
const ParentChildRequest = require('./models/ParentChildRequest');
require('dotenv').config();

async function cleanOldRequests() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\n 清理包含undefined的旧请求记录...\n');

    // 查找所有包含undefined的请求
    const requests = await ParentChildRequest.find({
      message: { $regex: /undefined/i }
    });

    console.log(`📊 找到 ${requests.length} 条包含undefined的请求\n`);

    for (let req of requests) {
      console.log(`删除请求: ${req._id}`);
      console.log(`消息: ${req.message}`);
      console.log('-'.repeat(60));
    }

    if (requests.length > 0) {
      const result = await ParentChildRequest.deleteMany({
        message: { $regex: /undefined/i }
      });
      console.log(`\n✅ 已删除 ${result.deletedCount} 条请求记录`);
    } else {
      console.log('\n✅ 没有需要删除的请求');
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('错误:', err);
  }
}

cleanOldRequests();
