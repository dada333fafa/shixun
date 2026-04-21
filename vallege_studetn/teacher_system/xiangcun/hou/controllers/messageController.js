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

    const message = await Message.create({
      senderId: req.user.id,
      receiverId: receiver_id,
      matchId: match_id || null,
      content,
      type
    });

    // 获取发送者信息
    const sender = await User.findById(req.user.id);

    res.status(201).json({
      status: 'success',
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

// 获取聊天列表（按联系人分组）
exports.getChatList = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 获取所有与当前用户相关的消息
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId },
        { receiverId: currentUserId }
      ]
    }).sort({ createdAt: -1 });

    // 按联系人分组
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

    // 获取联系人信息
    const userIds = Array.from(chatMap.keys());
    const users = await User.find({ _id: { $in: userIds } });

    const chatList = users.map(user => {
      const chat = chatMap.get(user._id.toString());
      return {
        id: user._id,
        name: user.name,
        lastMessage: chat.lastMessage,
        time: formatTime(chat.lastMessageTime),
        unreadCount: chat.unreadCount
      };
    });

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
