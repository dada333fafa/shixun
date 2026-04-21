const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  getMe,
  updateMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 公共路由（无需认证）
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// 需要认证的路由
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
