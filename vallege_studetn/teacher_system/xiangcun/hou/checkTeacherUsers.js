const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const users = await User.find({ role: 'teacher' });
  console.log('教师用户数量:', users.length);
  users.forEach((u, i) => {
    console.log(`教师用户${i+1}:`, { 
      id: u._id, 
      username: u.username,
      name: u.name, 
      role: u.role 
    });
  });
  process.exit();
});
