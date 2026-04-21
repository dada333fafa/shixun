const express = require('express');
const router = express.Router();
const {
  getLearningProgress,
  updateLearningProgress
} = require('../controllers/learningProgressController');
const { protect, authorize } = require('../middleware/auth');

// 所有路由都需要教师权限
router.use(protect);
router.use(authorize('teacher'));

router.get('/', getLearningProgress);
router.put('/:id', updateLearningProgress);

module.exports = router;
