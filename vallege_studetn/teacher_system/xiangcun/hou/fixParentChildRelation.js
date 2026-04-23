const mongoose = require('mongoose');

async function fixParentChildRelation() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const ParentChildRequest = require('./models/ParentChildRequest');
    const Student = require('./models/Student');
    const Parent = require('./models/Parent');
    const User = require('./models/User'); // 加载User模型

    // 查找所有已接受的请求
    const acceptedRequests = await ParentChildRequest.find({ status: 'accepted' })
      .populate('parent')
      .populate('student');

    console.log(`📊 找到 ${acceptedRequests.length} 条已接受的请求\n`);

    let updatedCount = 0;

    for (const request of acceptedRequests) {
      console.log(`\n处理请求 ${request._id}:`);
      console.log(`  家长ID: ${request.parent._id}`);
      console.log(`  学生ID: ${request.student._id}`);

      // 获取家长的User ID
      const parentRecord = await Parent.findById(request.parent._id).populate('user');
      if (!parentRecord || !parentRecord.user) {
        console.log('  ⚠️  家长记录不存在，跳过');
        continue;
      }

      const parentUserId = parentRecord.user._id;
      console.log(`  家长User ID: ${parentUserId}`);

      // 获取学生记录
      const studentRecord = await Student.findById(request.student._id);
      if (!studentRecord) {
        console.log('  ⚠️  学生记录不存在，跳过');
        continue;
      }

      // 检查是否已经设置了parent字段
      if (studentRecord.parent && studentRecord.parent.toString() === parentUserId.toString()) {
        console.log(`  ✅ 已经关联，跳过`);
        continue;
      }

      // 更新学生的parent字段
      studentRecord.parent = parentUserId;
      await studentRecord.save();
      updatedCount++;

      console.log(`  ✅ 已更新学生 "${studentRecord.user}" 的parent字段为 ${parentUserId}`);
    }

    console.log(`\n🎉 完成！共更新 ${updatedCount} 条记录`);

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

fixParentChildRelation();
