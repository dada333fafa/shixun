const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadResource,
  getResources,
  getResourceById,
  downloadResource,
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

// 所有路由都需要认证（学生和老师都能访问）
router.use(protect);

// 添加调试日志
router.use((req, res, next) => {
  console.log('🔍 资源路由 - 方法:', req.method, '路径:', req.path);
  console.log('👤 用户角色:', req.user?.role, '用户ID:', req.user?.id);
  next();
});

// GET 接口 - 学生和老师都能访问（查看资源）
router.get('/', getResources);
router.get('/:id/download', downloadResource);  // 具体路由必须放在前面
router.get('/:id', getResourceById);

// POST/PUT/DELETE 接口 - 只有教师可以操作（上传、更新、删除资源）
router.post('/', authorize('teacher'), upload.single('file'), uploadResource);
router.put('/:id', authorize('teacher'), upload.single('file'), updateResource);
router.post('/:id/share', authorize('teacher'), shareResource);
router.delete('/:id', authorize('teacher'), deleteResource);

module.exports = router;
