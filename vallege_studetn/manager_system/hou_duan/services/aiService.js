const axios = require('axios');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

class AIService {
  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY;
    this.apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  }

  /**
   * 调用阿里云百炼API
   */
  async callDashScope(prompt) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'qwen-plus',
          input: {
            messages: [
              {
                role: 'system',
                content: '你是一个专业的教育顾问助手，负责根据学生需求匹配合适的教师。'
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
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.output.choices[0].message.content;
    } catch (error) {
      console.error('调用阿里云API失败:', error.response?.data || error.message);
      throw new Error('AI服务调用失败');
    }
  }

  /**
   * 获取所有教师信息
   */
  async getAllTeachers() {
    try {
      const teachers = await Teacher.find().populate('userId', 'name email phone');
      return teachers.map(teacher => ({
        id: teacher._id,
        name: teacher.userId?.name || '未知',
        subject: teacher.subject,
        education: teacher.education || '未填写',
        experience: teacher.experience || '未填写',
        introduction: teacher.introduction || '暂无介绍',
        rating: teacher.rating || 0,
        email: teacher.userId?.email || '',
        phone: teacher.userId?.phone || ''
      }));
    } catch (error) {
      console.error('获取教师列表失败:', error);
      throw error;
    }
  }

  /**
   * AI匹配教师
   */
  async matchTeachers(studentInfo) {
    try {
      // 获取所有教师数据
      const allTeachers = await this.getAllTeachers();
      
      // 构建提示词
      const prompt = this.buildPrompt(studentInfo, allTeachers);
      
      // 调用AI
      const aiResponse = await this.callDashScope(prompt);
      
      // 解析AI返回的结果
      const matchedTeachers = this.parseAIResponse(aiResponse, allTeachers);
      
      return {
        success: true,
        studentInfo,
        matchedTeachers,
        totalTeachers: allTeachers.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI匹配失败:', error);
      throw error;
    }
  }

  /**
   * 构建AI提示词
   */
  buildPrompt(studentInfo, teachers) {
    const teachersData = JSON.stringify(teachers, null, 2);
    
    return `
你是一个专业的教育顾问，需要根据学生信息从教师数据库中匹配合适的教师。

【学生信息】
- 年级：${studentInfo.grade}
- 学习需求：${studentInfo.learningNeeds}
- 心理状态：${studentInfo.psychologicalState}

【教师数据库】
${teachersData}

【匹配规则】
1. **智能匹配原则**：
   - 仔细分析学生的学习需求和心理状态
   - 只推荐真正适合该学生的教师
   - 不匹配的教師绝对不能推荐
   - 数量不限，可能0个，也可能多个，完全取决于匹配度

2. **学科教师匹配**：
   - 从学生的学习需求中提取需要的科目（如数学、英语、语文、物理等）
   - 匹配对应科目的教师
   - 优先考虑教师的年级是否匹配学生年级
   - 如果学生学习需求中提到多个科目，可以推荐多位学科教师
   - 如果学生没有明确的学科学习需求，可以不推荐学科教师

3. **心理教师匹配**：
   - 从学生的心理状态描述中识别心理问题类型（如焦虑、抑郁、自信心不足、压力大、人际关系问题、注意力不集中、家庭问题、创伤、生涯迷茫等）
   - 根据心理问题类型匹配有相应专长的心理教师
   - 心理教师的科目包括：心理健康、心理辅导、学习心理、家庭心理、生涯规划
   - 如果学生心理状态良好，没有明显问题，可以不推荐心理教师

4. **评分和优先级**：
   - 优先推荐评分高（rating >= 4.5）的教师
   - 考虑教师的教学经验是否与學生需求匹配
   - 同一类型的教师，按评分从高到低排序

【输出格式】
请严格按照以下JSON格式返回结果（不要添加任何其他文字）：
{
  "matchedTeachers": [
    {
      "id": "教师ID",
      "name": "教师姓名",
      "subject": "科目",
      "category": "学科教师" 或 "心理教师",
      "matchScore": 匹配分数(0-100),
      "reason": "推荐理由（说明为什么这位教师适合该学生，100字以内）"
    }
  ]
}

注意：
- 只返回JSON，不要有其他内容
- matchedTeachers数组可以为空（如果没有合适的教师）
- category只能是"学科教师"或"心理教师"
- matchScore是你对匹配程度的评分（0-100分），基于科目匹配度、年级匹配度、专长匹配度等综合评估
- 推荐理由要具体说明为什么适合，引用学生的具体需求和教师的具体优势
- **重要：不匹配的教师绝对不能出现在结果中**
`;
  }

  /**
   * 解析AI返回结果
   */
  parseAIResponse(aiResponse, allTeachers) {
    try {
      // 尝试提取JSON
      let jsonStr = aiResponse;
      
      // 如果包含代码块标记，提取JSON部分
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const result = JSON.parse(jsonStr);
      
      // 补充完整的教师信息
      const enrichTeacherInfo = (teacherId) => {
        const teacher = allTeachers.find(t => t.id === teacherId || t.id.toString() === teacherId);
        if (!teacher) return null;
        
        return teacher;
      };
      
      // 处理匹配的教师列表
      const matchedTeachers = (result.matchedTeachers || []).map(t => {
        const fullInfo = enrichTeacherInfo(t.id);
        if (!fullInfo) return null;
        
        return {
          ...fullInfo,
          category: t.category || '未知',
          matchScore: t.matchScore || 0,
          reason: t.reason || ''
        };
      }).filter(Boolean);
      
      // 按匹配分数排序（从高到低）
      matchedTeachers.sort((a, b) => b.matchScore - a.matchScore);
      
      // 分类统计
      const subjectTeachers = matchedTeachers.filter(t => t.category === '学科教师');
      const psychologyTeachers = matchedTeachers.filter(t => t.category === '心理教师');
      
      return {
        matchedTeachers,
        subjectTeachers,
        psychologyTeachers,
        totalCount: matchedTeachers.length,
        rawResponse: aiResponse
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      console.error('原始响应:', aiResponse);
      
      // 如果解析失败，返回空结果
      return {
        matchedTeachers: [],
        subjectTeachers: [],
        psychologyTeachers: [],
        totalCount: 0,
        rawResponse: aiResponse,
        parseError: true
      };
    }
  }
}

module.exports = new AIService();
