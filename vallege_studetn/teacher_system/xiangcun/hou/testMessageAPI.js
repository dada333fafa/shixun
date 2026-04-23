// 测试消息API
const axios = require('axios');

async function testMessageAPI() {
  try {
    console.log('📋 测试消息API...');
    
    // 先登录获取token
    console.log('\n1. 登录获取token...');
    const loginRes = await axios.post('http://localhost:3000/api/users/login', {
      username: '111111',  // 使用实际存在的家长用户名
      password: '123456',
      role: 'parent'
    });
    
    console.log('✅ 登录成功:', loginRes.data.success || loginRes.data.status === 'success');
    const token = loginRes.data.token;
    const userId = loginRes.data.user?._id || loginRes.data.data?.user?._id;
    console.log('👤 家长用户ID:', userId);
    
    // 发送消息给老师
    console.log('\n2. 发送消息给老师...');
    const teacherId = '69e83057a7ff90923dbc5d14'; // 我是老师的ID
    console.log('   教师ID:', teacherId);
    
    const sendRes = await axios.post('http://localhost:3000/api/messages/', {
      receiver_id: teacherId,
      content: '老师你好，这是一条测试消息'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ 发送结果:', JSON.stringify(sendRes.data, null, 2));
    
    // 获取对话记录
    console.log('\n3. 获取对话记录...');
    const conversationRes = await axios.get(
      `http://localhost:3000/api/messages/conversation/${userId}/${teacherId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ 对话记录:', JSON.stringify(conversationRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('错误:', error.message);
      console.error('堆栈:', error.stack);
    }
  }
}

testMessageAPI();
