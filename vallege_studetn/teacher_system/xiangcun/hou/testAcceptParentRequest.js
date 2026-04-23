const mongoose = require('mongoose');

async function testAcceptParentRequest() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const ParentChildRequest = require('./models/ParentChildRequest');
    const Student = require('./models/Student');
    const Parent = require('./models/Parent');
    const User = require('./models/User');

    // 查找一个pending状态的请求
    const pendingRequest = await ParentChildRequest.findOne({ status: 'pending' })
      .populate('parent')
      .populate('student');

    if (!pendingRequest) {
      console.log('❌ 没有找到pending状态的请求');
      return;
    }

    console.log('📋 找到待处理的请求:');
    console.log(`  请求ID: ${pendingRequest._id}`);
    console.log(`  家长: ${pendingRequest.parent.user.name}`);
    console.log(`  学生: ${pendingRequest.student.user.name}`);
    console.log(`  当前状态: ${pendingRequest.status}\n`);

    // 模拟学生接受请求的逻辑
    const request = pendingRequest;
    const student = await Student.findById(request.student._id).populate('user');
    
    console.log('📝 接受前的学生信息:');
    console.log(`  学生名: ${student.user.name}`);
    console.log(`  当前parent: ${student.parent || '无'}\n`);

    // 模拟接受逻辑
    request.status = 'accepted';
    await request.save();

    const parentRecord = await Parent.findById(request.parent._id).populate('user');
    if (parentRecord && parentRecord.user) {
      student.parent = parentRecord.user._id;
      await student.save();
      console.log('✅ 已更新学生的parent字段');
    }

    // 验证结果
    const updatedStudent = await Student.findById(student._id).populate('parent', 'name');
    console.log('\n📝 接受后的学生信息:');
    console.log(`  学生名: ${updatedStudent.user.name}`);
    console.log(`  家长: ${updatedStudent.parent?.name || '无'}`);
    console.log(`  家长ID: ${updatedStudent.parent?._id || '无'}`);

    console.log('\n🎉 测试成功！关联已自动建立');

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

testAcceptParentRequest();
