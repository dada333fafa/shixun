const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

// 所有路由都需要登录（学生和老师都能查看学生列表）
router.use(protect);

router.get('/', getStudents);
router.get('/:id', getStudentById);

module.exports = router;
