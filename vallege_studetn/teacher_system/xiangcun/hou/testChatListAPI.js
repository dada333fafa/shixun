const mongoose = require('mongoose');

async function testChatListAPI() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    // 模拟后端getChatList逻辑
    const Teacher = require('./models/Teacher');
    const TeacherStudentMatch = require('./models/TeacherStudentMatch');
    const Student = require('./models/Student');
    const Message = require('./models/Message');
    const User = require('./models/User');

    const currentUserId = '69e83057a7ff90923dbc5d14';
    
    console.log('👨‍ 测试老师聊天列表 API\n');

    // 1. 获取Teacher记录
    const teacher = await Teacher.findOne({ user: currentUserId });
    console.log('✅ Teacher ID:', teacher._id);

    // 2. 获取已匹配的学生
    const matches = await TeacherStudentMatch.find({
      teacher: teacher._id,
      status: { $in: ['active', 'approved'] }
    }).populate('student');

    console.log(`\n📋 匹配记录数量: ${matches.length}`);
    matches.forEach((m, i) => {
      console.log(`  ${i + 1}. Student ID: ${m.student?._id || 'null'}`);
    });

    // 3. 获取学生详情
    const studentIds = matches.map(m => m.student?._id).filter(id => id);
    console.log('\n 学生IDs:', studentIds);

    const studentRecords = await Student.find({ _id: { $in: studentIds } })
      .populate('user')
      .populate('parent');

    console.log(`\n📊 学生记录数量: ${studentRecords.length}`);
    studentRecords.forEach((s, i) => {
      console.log(`  ${i + 1}. 学生名: ${s.user?.name || '未知'}`);
      console.log(`     家长: ${s.parent?.name || '无'}`);
    });

    // 4. 获取家长IDs
    const parentUserIds = [];
    const parentUserIdSet = new Set();
    
    studentRecords.forEach(student => {
      if (student.parent && student.parent._id) {
        const parentUserId = student.parent._id.toString();
        if (!parentUserIdSet.has(parentUserId)) {
          parentUserIdSet.add(parentUserId);
          parentUserIds.push(parentUserId);
        }
      }
    });

    console.log('\n👨‍👩‍ 家长User IDs:', parentUserIds);

    // 5. 所有联系人IDs
    const studentUserIds = studentRecords.map(s => s.user._id);
    const allContactIds = [...studentUserIds, ...parentUserIds];
    
    console.log('\n📞 所有联系人IDs:', allContactIds);

    // 6. 获取消息
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: { $in: allContactIds } },
        { senderId: { $in: allContactIds }, receiverId: currentUserId }
      ]
    }).sort({ createdAt: -1 });

    console.log(`\n💬 消息数量: ${messages.length}`);

    // 7. 按联系人分组
    const chatMap = new Map();
    for (const msg of messages) {
      const otherUserId = msg.senderId.toString() === currentUserId 
        ? msg.receiverId.toString() 
        : msg.senderId.toString();
      
      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0
        });
      }
    }

    // 8. 构造聊天列表
    const chatList = [];

    // 添加学生
    studentRecords.forEach(student => {
      const userId = student.user._id.toString();
      const chat = chatMap.get(userId);
      
      chatList.push({
        id: userId,
        name: student.user.name,
        info: '学生',
        lastMessage: chat ? chat.lastMessage : '点击开始聊天',
        time: chat ? formatTime(chat.lastMessageTime) : '',
        type: 'student'
      });
    });

    // 添加家长（去重）
    const parentMap = new Map();
    studentRecords.forEach(student => {
      if (student.parent && student.parent._id) {
        const parentUserId = student.parent._id.toString();
        if (!parentMap.has(parentUserId)) {
          parentMap.set(parentUserId, []);
        }
        parentMap.get(parentUserId).push(student.user.name);
      }
    });

    parentMap.forEach((studentNames, parentUserId) => {
      const studentWithParent = studentRecords.find(s => 
        s.parent && s.parent._id && s.parent._id.toString() === parentUserId
      );
      
      if (studentWithParent && studentWithParent.parent) {
        const chat = chatMap.get(parentUserId);
        const remark = studentNames.length > 1 
          ? `${studentNames.join('、')}家长` 
          : `${studentNames[0]}家长`;
        
        chatList.push({
          id: parentUserId,
          name: studentWithParent.parent.name || remark,
          info: remark,
          lastMessage: chat ? chat.lastMessage : '点击开始聊天',
          time: chat ? formatTime(chat.lastMessageTime) : '',
          type: 'parent'
        });
      }
    });

    console.log('\n✅ 最终聊天列表:');
    chatList.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} (${c.info})`);
    });

    console.log(`\n🎯 总共 ${chatList.length} 个联系人`);

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
}

testChatListAPI();
