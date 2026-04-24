/**
 * AI匹配功能测试脚本
 * 用于测试后端API是否正常工作
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// 测试配置
const TEST_CONFIG = {
  studentToken: '', // 需要先从登录接口获取
  teacherToken: '', // 需要先从登录接口获取
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// 测试1: 学生匹配教师
async function testStudentMatchTeacher() {
  log(colors.blue, '\n========== 测试1: 学生匹配教师 ==========');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/ai/match-student`,
      {
        grade: '三年级',
        learningNeeds: '数学基础薄弱，需要加强练习'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': TEST_CONFIG.studentToken
        }
      }
    );

    if (response.data.success) {
      log(colors.green, '✅ 匹配成功！');
      log(colors.yellow, `找到 ${response.data.matchedTeachers.length} 位教师`);
      
      response.data.matchedTeachers.forEach((teacher, index) => {
        console.log(`\n${index + 1}. ${teacher.name}`);
        console.log(`   科目: ${teacher.subject}`);
        console.log(`   评分: ${teacher.rating}/5.0`);
        console.log(`   匹配度: ${teacher.matchScore}%`);
        console.log(`   理由: ${teacher.reason}`);
      });
    } else {
      log(colors.red, '❌ 匹配失败:', response.data.message);
    }
  } catch (error) {
    log(colors.red, '❌ 请求失败:', error.response?.data?.message || error.message);
  }
}

// 测试2: 教师匹配学生
async function testTeacherMatchStudent() {
  log(colors.blue, '\n========== 测试2: 教师匹配学生 ==========');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/ai/match-teacher`,
      {
        subject: '数学',
        grade: '三年级',
        experience: '3-5年',
        availability: '周末上午'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_CONFIG.teacherToken}`
        }
      }
    );

    if (response.data.success) {
      log(colors.green, '✅ 匹配成功！');
      log(colors.yellow, `找到 ${response.data.matchedStudents.length} 位学生`);
      
      response.data.matchedStudents.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.name}`);
        console.log(`   年级: ${student.grade}`);
        console.log(`   学习需求: ${student.learning_needs || '未填写'}`);
        console.log(`   匹配度: ${student.matchScore}%`);
      });
    } else {
      log(colors.red, '❌ 匹配失败:', response.data.message);
    }
  } catch (error) {
    log(colors.red, '❌ 请求失败:', error.response?.data?.message || error.message);
  }
}

// 测试3: 健康检查
async function testHealthCheck() {
  log(colors.blue, '\n========== 测试3: 后端健康检查 ==========');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    
    if (response.data.status === 'success') {
      log(colors.green, '✅ 后端服务运行正常');
      log(colors.yellow, `消息: ${response.data.message}`);
      log(colors.yellow, `时间: ${response.data.timestamp}`);
    }
  } catch (error) {
    log(colors.red, '❌ 后端服务未启动或无法访问');
    log(colors.red, '请先启动后端服务器: cd teacher_system/xiangcun/hou && node app.js');
  }
}

// 主函数
async function runTests() {
  log(colors.green, '========================================');
  log(colors.green, '  AI匹配功能测试');
  log(colors.green, '========================================');
  
  // 首先检查后端是否运行
  await testHealthCheck();
  
  // 提示用户输入token
  log(colors.yellow, '\n⚠️  注意: 需要先获取有效的认证token');
  log(colors.yellow, '请通过登录接口获取token，然后更新TEST_CONFIG中的值');
  log(colors.yellow, '\n或者您可以手动测试:');
  log(colors.yellow, '1. 使用Postman或浏览器调用登录接口');
  log(colors.yellow, '2. 复制返回的token');
  log(colors.yellow, '3. 更新本文件中的TEST_CONFIG');
  log(colors.yellow, '4. 重新运行此测试脚本');
  
  // 如果token已配置，执行测试
  if (TEST_CONFIG.studentToken && TEST_CONFIG.teacherToken) {
    await testStudentMatchTeacher();
    await testTeacherMatchStudent();
  } else {
    log(colors.yellow, '\n⏭️  跳过API测试（未配置token）');
  }
  
  log(colors.green, '\n========================================');
  log(colors.green, '  测试完成');
  log(colors.green, '========================================\n');
}

// 运行测试
runTests().catch(err => {
  log(colors.red, '测试执行出错:', err);
});
