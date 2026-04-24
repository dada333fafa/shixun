const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证token
exports.protect = async (req, res, next) => {
  let token;

  // 兼容两种 Token 传递方式：x-auth-token 或 Authorization Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: '未授权,请先登录'
    });
  }

  try {
    // 验证token
    const jwtSecret = process.env.JWT_SECRET || 'rural_education_secret_key_2026';
    console.log('🔑 JWT Secret:', jwtSecret.substring(0, 10) + '...');
    console.log('🎫 Token:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token验证成功, decoded:', decoded);

    // 获取用户信息
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Token验证失败:', error.message);
    console.error('错误详情:', error);
    return res.status(401).json({
      status: 'error',
      message: '认证失败,请重新登录'
    });
  }
};

// 角色验证
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: '权限不足'
      });
    }
    next();
  };
};
