const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  // 从请求头获取token
  const token = req.header('x-auth-token');

  // 检查token是否存在
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, 'your_jwt_secret'); // 实际应用中应该使用环境变量
    
    // 获取用户信息
    req.user = await User.findById(decoded.user.id).select('-password');
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;