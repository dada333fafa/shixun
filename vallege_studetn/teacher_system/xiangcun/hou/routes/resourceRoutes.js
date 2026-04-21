const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  shareResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resources/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // 提取文件扩展名
    const ext = file.originalname.split('.').pop();
    // 使用纯英文文件名，避免Windows编码问题
    cb(null, uniqueSuffix + '.' + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 限制50MB
});

// 所有路由都需要教师权限
router.use(protect);
router.use(authorize('teacher'));

router.post('/', upload.single('file'), uploadResource);
router.get('/', getResources);
router.get('/:id', getResourceById);
router.put('/:id', upload.single('file'), updateResource);  // 更新资源（支持文件上传）
router.post('/:id/share', shareResource);
router.delete('/:id', deleteResource);

module.exports = router;
