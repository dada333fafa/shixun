const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  scheduleCounseling,
  getStudentSchedules,
  acceptSchedule,
  getTeacherSchedules
} = require('../controllers/psychologicalScheduleController');

// 教师安排咨询
router.post('/', protect, scheduleCounseling);

// 教师获取自己的咨询安排列表
router.get('/', protect, getTeacherSchedules);

// 学生获取自己的咨询安排
router.get('/student/:studentId', protect, getStudentSchedules);

// 学生接受咨询安排
router.put('/:id/accept', protect, acceptSchedule);

module.exports = router;
