const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// 所有路由都需要教师权限
router.use(protect);
router.use(authorize('teacher'));

router.get('/', getStudents);
router.get('/:id', getStudentById);

module.exports = router;
