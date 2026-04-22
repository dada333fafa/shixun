const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacherById,
  getDashboard
} = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');

// 所有路由都需要登录（学生和老师都能查看教师列表）
router.use(protect);

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.get('/dashboard', getDashboard);

module.exports = router;
