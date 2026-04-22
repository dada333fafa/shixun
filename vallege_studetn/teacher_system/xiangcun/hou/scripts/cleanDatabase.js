const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Drop the problematic index
    await mongoose.connection.db.collection('students').dropIndex('userId_1');
    console.log('Dropped userId_1 index from students');
  } catch (e) {
    console.log('Index may not exist, skipping:', e.message);
  }
  
  try {
    // Clear old data
    await mongoose.connection.db.collection('students').deleteMany({});
    console.log('Cleared students collection');
    
    await mongoose.connection.db.collection('teachers').deleteMany({});
    console.log('Cleared teachers collection');
    
    await mongoose.connection.db.collection('users').deleteMany({});
    console.log('Cleared users collection');
    
    console.log('Database cleaned successfully!');
  } catch (e) {
    console.error('Error cleaning database:', e);
  } finally {
    process.exit(0);
  }
}).catch(e => {
  console.error('Connection error:', e);
  process.exit(1);
});
