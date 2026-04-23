const Message = require('../models/Message');
const User = require('../models/User');

// 发送消息
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, match_id, content, type = 'text' } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({
        status: 'error',
        message: '请填写必填字段'
      });
    }

    // 兼容两种参数格式：receiver_id 或 receiverId
    const receiverId = receiver_id || req.body.receiverId;
    const senderId = req.user.id; // 从token获取发送者

    const message = await Message.create({
      senderId: senderId,
      receiverId: receiverId,
      matchId: match_id || null,
      content,
      type
    });

    // 获取发送者信息
    const sender = await User.findById(senderId);

    console.log('✅ 消息发送成功:', {
      from: sender.name,
      fromId: senderId,
      to: receiverId,
      content: content.substring(0, 50)
    });

    res.status(201).json({
      success: true,
      message: '消息发送成功',
      data: {
        id: message._id,
        sender_id: message.senderId,
        sender_name: sender.name,
        receiver_id: message.receiverId,
        content: message.content,
        type: message.type,
        status: message.status,
        created_at: message.createdAt
      }
    });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取聊天列表（按联系人分组）- 显示已匹配的学生和家长
exports.getChatList = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const Teacher = require('../models/Teacher');
    const TeacherStudentMatch = require('../models/TeacherStudentMatch');
    const Student = require('../models/Student');
    const Parent = require('../models/Parent');
    const User = require('../models/User');
    
    // 1. 获取当前教师的Teacher记录
    const teacher = await Teacher.findOne({ user: currentUserId });
    if (!teacher) {
      return res.json({
        status: 'success',
        message: '获取成功',
        data: []
      });
    }
    
    // 2. 获取该教师所有已匹配的学生（必须是active状态，表示家长和老师都同意了）
    const matches = await TeacherStudentMatch.find({
      teacher: teacher._id,
      status: { $in: ['active'] }  // 只查询active状态的匹配
    }).populate('student');
    
    // 3. 获取这些学生的详细信息（包括家长信息）
    // 注意：Student.parent 字段直接指向 User（家长的user_id）
    const studentIds = matches.map(m => m.student._id);
    const studentRecords = await Student.find({ _id: { $in: studentIds } })
      .populate('user')
      .populate('parent'); // parent字段直接指向User
    
    console.log('📊 学生记录:', studentRecords.map(s => ({
      name: s.user?.name,
      parentId: s.parent?._id || s.parent
    })));
    
    // 4. 创建学生user_id到学生信息的映射
    const studentUserMap = new Map();
    studentRecords.forEach(student => {
      if (student.user && student.user._id) {
        studentUserMap.set(student.user._id.toString(), student);
      }
    });
    
    // 5. 获取所有家长user_id（去重）
    const parentUserIds = [];
    const parentUserIdSet = new Set();
    
    studentRecords.forEach(student => {
      // student.parent 是 User 对象
      if (student.parent && student.parent._id) {
        const parentUserId = student.parent._id.toString();
        if (!parentUserIdSet.has(parentUserId)) {
          parentUserIdSet.add(parentUserId);
          parentUserIds.push(parentUserId);
        }
      }
    });
    
    console.log('👨‍👩‍👧‍👦 家长User IDs:', parentUserIds);
    
    // 6. 获取所有联系人（学生+家长）的user_id
    const studentUserIds = studentRecords.map(s => s.user._id);
    const allContactIds = [...studentUserIds, ...parentUserIds];
    
    // 7. 获取与这些联系人（学生和家长）的消息
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: { $in: allContactIds } },
        { senderId: { $in: allContactIds }, receiverId: currentUserId }
      ]
    }).sort({ createdAt: -1 });
    
    // 8. 按联系人分组消息
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
      
      // 统计未读消息
      if (msg.receiverId.toString() === currentUserId && msg.status === 'sent') {
        const chat = chatMap.get(otherUserId);
        chat.unreadCount++;
      }
    }
    
    // 9. 构造聊天列表 - 先添加学生
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
        unreadCount: chat ? chat.unreadCount : 0,
        type: 'student'
      });
    });
    
    // 10. 添加家长（去重：如果多个学生同一个家长，只显示一次）
    const parentMap = new Map(); // parentUserId -> [studentNames]
    
    studentRecords.forEach(student => {
      // student.parent 是 User 对象
      if (student.parent && student.parent._id) {
        const parentUserId = student.parent._id.toString();
        
        if (!parentMap.has(parentUserId)) {
          parentMap.set(parentUserId, []);
        }
        
        // 添加这个学生的名字到该家长的备注中
        parentMap.get(parentUserId).push(student.user.name);
      }
    });
    
    console.log('👨‍👩‍👧‍ 家长映射:', Array.from(parentMap.entries()));
    
    // 构造家长列表
    parentMap.forEach((studentNames, parentUserId) => {
      // 从 studentRecords 中找到有该家长的学生
      const studentWithParent = studentRecords.find(s => 
        s.parent && s.parent._id && s.parent._id.toString() === parentUserId
      );
      
      if (studentWithParent && studentWithParent.parent) {
        const chat = chatMap.get(parentUserId);
        
        // 如果有多个学生，显示所有学生名字作为备注
        const remark = studentNames.length > 1 
          ? `${studentNames.join('、')}家长` 
          : `${studentNames[0]}家长`;
        
        // student.parent 就是家长的 User 对象
        const parentUser = studentWithParent.parent;
        
        chatList.push({
          id: parentUserId,
          name: parentUser.name || remark,
          info: remark,
          lastMessage: chat ? chat.lastMessage : '点击开始聊天',
          time: chat ? formatTime(chat.lastMessageTime) : '',
          unreadCount: chat ? chat.unreadCount : 0,
          type: 'parent'
        });
      }
    });
    
    console.log('✅ 最终聊天列表:', chatList.map(c => ({ name: c.name, info: c.info, type: c.type })));
    
    res.json({
      status: 'success',
      message: '获取成功',
      data: chatList
    });
  } catch (error) {
    console.error('获取聊天列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取与某用户的聊天记录
exports.getMessages = async (req, res) => {
  try {
    const { user_id, match_id, page = 1, page_size = 50 } = req.query;

    let query = {};
    
    if (match_id) {
      query.matchId = match_id;
    } else if (user_id) {
      query.$or = [
        { senderId: req.user.id, receiverId: user_id },
        { senderId: user_id, receiverId: req.user.id }
      ];
    } else {
      // 获取当前用户的所有消息
      query.$or = [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ];
    }

    const skip = (page - 1) * page_size;
    
    const messages = await Message.find(query)
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(page_size));

    const total = await Message.countDocuments(query);

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        messages: messages.map(m => ({
          id: m._id,
          sender_id: m.senderId._id,
          sender_name: m.senderId.name,
          receiver_id: m.receiverId._id,
          content: m.content,
          type: m.type,
          status: m.status,
          created_at: m.createdAt
        })),
        pagination: {
          total,
          page: parseInt(page),
          page_size: parseInt(page_size),
          pages: Math.ceil(total / page_size)
        }
      }
    });
  } catch (error) {
    console.error('获取消息列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 标记消息已读
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: '消息不存在'
      });
    }

    // 只有接收者可以标记为已读
    if (message.receiverId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: '无权操作'
      });
    }

    message.status = 'read';
    await message.save();

    res.json({
      status: 'success',
      message: '标记成功',
      data: {
        id: message._id,
        status: message.status
      }
    });
  } catch (error) {
    console.error('标记消息已读错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 格式化时间
function formatTime(date) {
  const now = new Date();
  const msgDate = new Date(date);
  const diff = now - msgDate;
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  }
  
  // 小于24小时
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前';
  }
  
  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return days === 1 ? '昨天' : days + '天前';
  }
  
  // 其他情况显示日期
  return msgDate.toLocaleDateString('zh-CN');
}
