const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getChatList,
  markAsRead
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

// 所有路由都需要教师权限
router.use(protect);
router.use(authorize('teacher'));

router.post('/', sendMessage);
router.get('/list', getChatList);  // 获取聊天列表
router.get('/', getMessages);
router.put('/:id/read', markAsRead);

module.exports = router;
