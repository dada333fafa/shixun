const mongoose = require('mongoose');
const ParentChildRequest = require('./models/ParentChildRequest');
const Parent = require('./models/Parent');
const Student = require('./models/Student');
const User = require('./models/User');
require('dotenv').config();

async function checkRequests() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\n🔍 检查家长-孩子请求记录：\n');

    // 查找所有请求
    const requests = await ParentChildRequest.find({}).sort({ createdAt: -1 });
    console.log(`📊 总共 ${requests.length} 条请求记录\n`);

    for (let req of requests) {
      console.log(`请求ID: ${req._id}`);
      console.log(`状态: ${req.status}`);
      
      // 获取家长信息
      const parent = await Parent.findById(req.parent).populate('user');
      if (parent) {
        console.log(`家长: ${parent.user.name} (ID: ${parent._id})`);
      }

      // 获取学生信息
      const student = await Student.findById(req.student).populate('user');
      if (student) {
        console.log(`学生: ${student.user.name} (ID: ${student._id}, UserID: ${student.user._id})`);
      }

      console.log(`消息: ${req.message}`);
      console.log(`创建时间: ${req.createdAt}`);
      console.log('-'.repeat(60));
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('错误:', err);
  }
}

checkRequests();
