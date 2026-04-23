const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: '用户不存在' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: '未授权，token无效' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: '未授权，没有token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: '需要管理员权限' });
  }
};

module.exports = { protect, adminOnly };
