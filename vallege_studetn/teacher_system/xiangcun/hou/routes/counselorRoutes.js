const express = require('express');
const router = express.Router();
const { getCounselors } = require('../controllers/counselorController');
const { protect } = require('../middleware/auth');

// 获取咨询师列表（学生和老师都能访问）
router.get('/', protect, getCounselors);

module.exports = router;
