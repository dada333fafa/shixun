// 简单的 API 测试文件
const axios = require('axios');

async function testAPI() {
  try {
    console.log('正在测试后端 API...');
    
    // 测试根路径
    const response = await axios.get('http://localhost:5000');
    console.log('根路径响应:', response.data);
    
    // 测试获取教学资源
    try {
      const resourcesResponse = await axios.get('http://localhost:5000/api/resources');
      console.log('教学资源数量:', resourcesResponse.data.length);
    } catch (err) {
      console.log('教学资源API测试:', err.response?.data || err.message);
    }
    
    // 测试获取AI推荐
    try {
      const aiResponse = await axios.get('http://localhost:5000/api/ai');
      console.log('AI推荐数量:', aiResponse.data.length);
    } catch (err) {
      console.log('AI推荐API测试:', err.response?.data || err.message);
    }
    
    console.log('API 测试完成');
  } catch (error) {
    console.error('API 测试出错:', error.message);
  }
}

testAPI();