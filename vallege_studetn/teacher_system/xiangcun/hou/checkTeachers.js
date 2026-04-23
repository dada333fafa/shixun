const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Teacher = require('./models/Teacher');
  const teachers = await Teacher.find({}).populate('user');
  console.log('教师数量:', teachers.length);
  teachers.forEach((t, i) => {
    console.log(`教师${i+1}:`, { 
      id: t._id, 
      userId: t.user?._id, 
      name: t.user?.name, 
      subject: t.subject 
    });
  });
  process.exit();
});
