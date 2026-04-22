const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  // 兼容两种 Token 传递方式：x-auth-token 或 Authorization Bearer
  let token = req.header('x-auth-token');
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 检查token是否存在
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // 验证token - 统一使用教师端的密钥
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rural_education_secret_key_2026');
    
    // 获取用户信息 (兼容 teacher 端 payload 结构 { id } 和 student 端 { user: { id } })
    const userId = decoded.id || (decoded.user && decoded.user.id);
    if (!userId) {
      return res.status(401).json({ msg: 'Token format invalid' });
    }

    req.user = await User.findById(userId).select('-password');
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;