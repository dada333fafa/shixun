const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// @route   POST api/messages
// @desc    发送消息
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, matchId } = req.body;

    // 验证必填字段
    if (!receiverId || !content) {
      return res.status(400).json({ msg: '接收者ID和消息内容不能为空' });
    }

    // 如果receiverId是字符串形式的ObjectId，转换为ObjectId
    let receiverObjectId;
    if (mongoose.Types.ObjectId.isValid(receiverId)) {
      receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    } else {
      return res.status(400).json({ msg: '无效的接收者ID' });
    }

    // 创建新消息
    const newMessage = new Message({
      sender: req.user._id,
      receiver: receiverObjectId,
      content: content,
      match: matchId || null,
      status: 'sent'
    });

    const message = await newMessage.save();
    
    // 填充发送者和接收者信息
    await message.populate('sender', '_id username name');
    await message.populate('receiver', '_id username name');

    res.json(message);
  } catch (err) {
    console.error('发送消息错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/messages/:userId
// @desc    获取与特定用户的聊天记录
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    // 验证并转换ObjectId
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ msg: '无效的用户ID' });
    }

    const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);

    // 获取两个用户之间的所有消息
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserObjectId },
        { sender: otherUserObjectId, receiver: currentUserId }
      ]
    })
    .populate('sender', '_id username name')
    .populate('receiver', '_id username name')
    .sort({ createdAt: 1 }); // 按时间升序排列

    res.json(messages);
  } catch (err) {
    console.error('获取消息错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/messages/conversations
// @desc    获取用户的对话列表
// @access  Private
router.get('/conversations/list', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // 获取所有与当前用户有消息往来的用户ID
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).populate('sender', 'username name').populate('receiver', 'username name');

    // 整理对话列表
    const conversations = {};
    
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      const otherUserId = otherUser._id.toString();
      
      if (!conversations[otherUserId] || new Date(msg.createdAt) > new Date(conversations[otherUserId].lastMessageTime)) {
        conversations[otherUserId] = {
          userId: otherUserId,
          username: otherUser.username,
          name: otherUser.name,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt
        };
      }
    });

    // 转换为数组并按最后消息时间排序
    const conversationList = Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(conversationList);
  } catch (err) {
    console.error('获取对话列表错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   PUT api/messages/:messageId/read
// @desc    标记消息为已读
// @access  Private
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ msg: '消息不存在' });
    }

    // 只有接收者可以标记为已读
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: '无权限操作此消息' });
    }

    message.status = 'read';
    await message.save();

    res.json(message);
  } catch (err) {
    console.error('标记消息已读错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;
