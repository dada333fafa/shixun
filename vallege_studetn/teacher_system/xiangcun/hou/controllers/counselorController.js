const Counselor = require('../models/Counselor');

// 获取所有咨询师列表
exports.getCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find({ isActive: true })
      .sort({ createdAt: 1 });

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        counselors: counselors
      }
    });
  } catch (error) {
    console.error('获取咨询师列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
