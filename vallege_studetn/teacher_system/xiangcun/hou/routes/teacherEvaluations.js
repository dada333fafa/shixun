const express = require('express');
const router = express.Router();
const {
  addOrUpdateEvaluation,
  getEvaluationsByStudent,
  getEvaluationByTeacherAndStudent
} = require('../controllers/teacherEvaluationController');
const { protect } = require('../middleware/auth');

// 所有路由都需要认证
router.use(protect);

// 教师添加或更新评价
router.post('/', addOrUpdateEvaluation);

// 获取学生对所有教师的评价（家长端使用）
router.get('/student/:studentId', getEvaluationsByStudent);

// 教师获取自己对某个学生的评价
router.get('/student/:studentId/my-evaluation', getEvaluationByTeacherAndStudent);

module.exports = router;
