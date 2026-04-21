const express = require('express');
const router = express.Router();
const {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch
} = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/auth');

// 所有路由都需要教师权限
router.use(protect);
router.use(authorize('teacher'));

router.post('/', createMatch);
router.get('/', getMatches);
router.get('/:id', getMatchById);
router.put('/:id', updateMatch);
router.delete('/:id', deleteMatch);

module.exports = router;
