const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getChatList,
  markAsRead
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

// 所有路由都需要登录权限（学生和教师都可以使用聊天功能）
router.use(protect);
// 不限制角色，学生和老师都能使用聊天
// router.use(authorize('teacher'));

router.post('/', sendMessage);
router.get('/list', getChatList);  // 获取聊天列表
router.get('/', getMessages);
router.put('/:id/read', markAsRead);

module.exports = router;
