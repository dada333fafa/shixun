/**
 * AI匹配服务 - 使用阿里云百炼大模型
 */

const axios = require('axios');

// 阿里云百炼API配置
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_API_URL = process.env.DASHSCOPE_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

/**
 * 调用通义千问模型
 * @param {string} prompt - 提示词
 * @returns {Promise<object>} AI响应结果
 */
const callAIModel = async (prompt) => {
  try {
    console.log('🤖 调用AI模型...');
    
    const response = await axios.post(
      DASHSCOPE_API_URL,
      {
        model: 'qwen-plus', // 使用通义千问Plus模型
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的教育匹配AI助手，负责分析教师画像和学生画像，给出精准的师生匹配建议。你需要返回JSON格式的结果。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
        },
        timeout: 60000 // 60秒超时，AI匹配需要较长时间
      }
    );

    console.log('✅ AI模型调用成功');
    return response.data;
  } catch (error) {
    console.error('❌ AI模型调用失败:', error.response?.data || error.message);
    throw new Error('AI服务调用失败：' + (error.response?.data?.message || error.message));
  }
};

/**
 * 智能匹配教师和学生
 * @param {object} teacher - 教师信息
 * @param {Array} students - 学生列表
 * @returns {Promise<Array>} 匹配结果列表
 */
const matchTeacherAndStudents = async (teacher, students) => {
  // 构建教师画像
  const teacherProfile = {
    id: teacher._id,
    name: teacher.name,
    subjects: teacher.subjects || ['数学'], // 教授科目
    experience: teacher.experience || '1-3年', // 教学经验
    availability: teacher.availability || '工作日晚上、周末', // 可辅导时间
    grade_level: teacher.gradeLevel || '小学', // 教学年级
    teaching_style: teacher.teachingStyle || '温和耐心' // 教学风格
  };

  // 构建学生画像列表
  const studentProfiles = students.map(student => ({
    id: student._id,
    name: student.name,
    grade: student.grade || '五年级',
    subjects: student.weakSubjects || ['数学'], // 薄弱科目
    performance: student.performance || '中等', // 学习成绩
    learning_style: student.learningStyle || '需要鼓励', // 学习风格
    psychological_state: student.psychologicalState || '正常', // 心理状态
    availability: student.availability || '放学后、周末' // 可辅导时间
  }));

  // 构建AI提示词
  const prompt = `
# 师生智能匹配任务

## 教师画像
- 姓名: ${teacherProfile.name}
- 教授科目: ${teacherProfile.subjects.join('、')}
- 教学经验: ${teacherProfile.experience}
- 可辅导时间: ${teacherProfile.availability}
- 教学年级: ${teacherProfile.grade_level}
- 教学风格: ${teacherProfile.teaching_style}

## 待匹配学生列表
${studentProfiles.map((s, index) => `
### 学生${index + 1}
- 姓名: ${s.name}
- 年级: ${s.grade}
- 薄弱科目: ${s.subjects.join('、')}
- 学习成绩: ${s.performance}
- 学习风格: ${s.learning_style}
- 心理状态: ${s.psychological_state}
- 可辅导时间: ${s.availability}
`).join('\n')}

## 匹配规则
请根据以下维度进行综合评估，给出匹配度评分（0-100分）：

1. **科目匹配度**（权重30%）: 教师教授的科目与学生薄弱科目的匹配程度
2. **年级适配度**（权重20%）: 教师可教学年级与学生年级的匹配程度
3. **时间匹配度**（权重20%）: 教师可辅导时间与学生可用时间的重合度
4. **风格互补度**（权重15%）: 教师教学风格是否适合学生的学习风格
5. **心理适配度**（权重15%）: 教师是否适合辅导该心理状态的学生

## 输出要求
请返回JSON格式的结果，不要包含任何其他文字说明。格式如下：

{
  "matches": [
    {
      "student_id": "学生ID",
      "student_name": "学生姓名",
      "match_score": 95,
      "match_reason": "详细的匹配原因，说明为什么匹配度高",
      "strengths": ["匹配优势1", "匹配优势2"],
      "suggestions": ["辅导建议1", "辅导建议2"],
      "subject_match": 90,
      "grade_match": 95,
      "time_match": 100,
      "style_match": 90,
      "psychology_match": 95
    }
  ]
}

请按照match_score从高到低排序，只返回匹配度>=70分的学生。
`;

  try {
    const aiResponse = await callAIModel(prompt);
    
    console.log('📊 AI原始响应:', JSON.stringify(aiResponse, null, 2));
    
    // 解析AI返回的结果 - 兼容多种响应格式
    let content = '';
    
    // 格式1: output.choices[0].message.content (新格式)
    if (aiResponse.output?.choices?.[0]?.message?.content) {
      content = aiResponse.output.choices[0].message.content;
    }
    // 格式2: output.text (旧格式)
    else if (aiResponse.output?.text) {
      content = aiResponse.output.text;
    }
    // 格式3: 直接返回字符串
    else if (typeof aiResponse === 'string') {
      content = aiResponse;
    }
    
    if (!content) {
      console.error('❌ AI返回内容为空，完整响应:', aiResponse);
      throw new Error('AI返回结果为空');
    }

    console.log('📝 AI返回内容:', content.substring(0, 500) + '...');

    // 提取JSON（可能包含markdown代码块）
    let jsonStr = content;
    if (content.includes('```json')) {
      const match = content.match(/```json\n([\s\S]*?)\n```/);
      jsonStr = match ? match[1] : content;
    } else if (content.includes('```')) {
      const match = content.match(/```\n([\s\S]*?)\n```/);
      jsonStr = match ? match[1] : content;
    }

    console.log('🔍 提取的JSON字符串:', jsonStr.substring(0, 300) + '...');

    const result = JSON.parse(jsonStr);
    
    console.log(`✅ AI匹配完成，共推荐 ${result.matches?.length || 0} 名学生`);
    
    return result.matches || [];
  } catch (error) {
    console.error('❌ AI匹配失败:', error.message);
    console.error('完整错误:', error);
    throw error;
  }
};

module.exports = {
  matchTeacherAndStudents
};
