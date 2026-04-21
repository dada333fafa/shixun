const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacherById,
  getDashboard
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

// 所有路由都需要教师权限
router.use(protect);
router.use(authorize('teacher'));

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.get('/dashboard', getDashboard);

module.exports = router;
