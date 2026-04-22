const axios = require('axios');

// 登录测试用户获取token
async function testAPI() {
  try {
    console.log('=== 测试教师端API ===\n');
    
    // 1. 登录教师账号
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      username: '888',
      password: '123456',
      role: 'teacher'
    });
    
    console.log('登录结果:', loginRes.data.status);
    const token = loginRes.data.data.token;
    const userId = loginRes.data.data.user.id;
    console.log('用户ID:', userId);
    
    // 2. 获取学生列表
    console.log('\n--- 获取学生列表 ---');
    const studentsRes = await axios.get('http://localhost:3000/api/v1/students', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('状态:', studentsRes.data.status);
    console.log('学生数量:', studentsRes.data.data.students?.length || 0);
    if (studentsRes.data.data.students) {
      studentsRes.data.data.students.forEach(s => {
        console.log('  - 学生:', s.name, 'ID:', s.user_id);
      });
    }
    
    // 3. 获取聊天列表
    console.log('\n--- 获取聊天列表 ---');
    const chatListRes = await axios.get('http://localhost:3000/api/v1/messages/list', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('状态:', chatListRes.data.status);
    console.log('聊天对象数量:', chatListRes.data.data?.length || 0);
    if (chatListRes.data.data) {
      chatListRes.data.data.forEach(c => {
        console.log('  - 聊天对象:', c.name, 'ID:', c.id);
      });
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testAPI();
