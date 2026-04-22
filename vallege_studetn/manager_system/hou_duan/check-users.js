const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  
  const count = await User.countDocuments();
  console.log('总用户数:', count);
  
  const users = await User.find().select('username name role isActive');
  console.log('\n用户列表:');
  users.forEach(u => {
    console.log(`- ${u.username} (${u.name}) - ${u.role} - ${u.isActive ? '活跃' : '禁用'}`);
  });
  
  process.exit(0);
});
