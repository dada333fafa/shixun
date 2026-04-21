const express = require('express');
const router = express.Router();
const {
  createPsychologicalRecord,
  getPsychologicalStatus
} = require('../controllers/psychologicalController');
const { protect, authorize } = require('../middleware/auth');

// 所有路由都需要教师权限
router.use(protect);
router.use(authorize('teacher'));

router.post('/', createPsychologicalRecord);
router.get('/', getPsychologicalStatus);

module.exports = router;
