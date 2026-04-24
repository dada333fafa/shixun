const AiTeacherProfile = require('../models/AiTeacherProfile');
const AiStudentProfile = require('../models/AiStudentProfile');

class AIService {
  /**
   * 获取所有教师信息（从AI专用表）
   */
  async getAllTeachers() {
    try {
      const teachers = await AiTeacherProfile.find({ is_active: true });
      return teachers.map(teacher => ({
        id: teacher._id,
        name: teacher.name,
        subject: teacher.subject,
        education: teacher.education || '未填写',
        experience: teacher.experience || '未填写',
        introduction: teacher.introduction || '暂无介绍',
        teaching_style: teacher.teaching_style || '',
        specialties: teacher.specialties || '',
        available_grades: teacher.available_grades || '',
        rating: teacher.rating || 0
      }));
    } catch (error) {
      console.error('获取AI教师列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有学生信息（从AI专用表）
   */
  async getAllStudents() {
    try {
      const students = await AiStudentProfile.find({ is_active: true });
      return students.map(student => ({
        id: student._id,
        name: student.name,
        grade: student.grade || '未设置',
        school: student.school || '',
        learning_needs: student.learning_needs || '',
        weak_subjects: student.weak_subjects || '',
        learning_goals: student.learning_goals || '',
        preferred_teacher_personality: student.preferred_teacher_personality || '',
        learning_style: student.learning_style || ''
      }));
    } catch (error) {
      console.error('获取AI学生列表失败:', error);
      throw error;
    }
  }

  /**
   * 为学生匹配老师
   * @param {Object} studentInfo - 学生信息 { grade, learningNeeds, teacherPersonality }
   */
  async matchTeachersForStudent(studentInfo) {
    try {
      const allTeachers = await this.getAllTeachers();
      
      // 从学习需求中提取科目关键词
      const subjectKeywords = this.extractSubjects(studentInfo.learningNeeds);
      
      // 计算每个教师的匹配分数
      const matchedTeachers = allTeachers.map(teacher => {
        let score = 0;
        let reasons = [];

        // 1. 科目匹配 (35%)
        if (subjectKeywords.length > 0) {
          const subjectMatch = subjectKeywords.some(keyword => 
            teacher.subject.includes(keyword)
          );
          if (subjectMatch) {
            score += 35;
            reasons.push(`教授${teacher.subject}，符合您的学习需求`);
          }
        } else {
          // 如果没有明确科目，给所有老师基础分
          score += 15;
        }

        // 2. 评分匹配 (25%)
        const ratingScore = (teacher.rating / 5) * 25;
        score += ratingScore;
        if (teacher.rating >= 4.5) {
          reasons.push(`评分优秀(${teacher.rating}/5.0)`);
        }

        // 3. 经验匹配 (20%)
        const expYears = this.parseExperience(teacher.experience);
        if (expYears >= 5) {
          score += 20;
          reasons.push('教学经验丰富');
        } else if (expYears >= 3) {
          score += 15;
        } else if (expYears >= 1) {
          score += 10;
        }

        // 4. 教育背景 (10%)
        if (teacher.education.includes('硕士') || teacher.education.includes('博士')) {
          score += 10;
          reasons.push('教育背景优秀');
        } else if (teacher.education.includes('本科')) {
          score += 7;
        }

        // 5. 性格匹配 (10%) - 如果学生提供了期望性格
        if (studentInfo.teacherPersonality && teacher.introduction) {
          const personalityMatch = this.checkPersonalityMatch(
            studentInfo.teacherPersonality, 
            teacher.introduction
          );
          if (personalityMatch) {
            score += 10;
            reasons.push('教师风格符合您的期望');
          }
        }

        return {
          ...teacher,
          matchScore: Math.round(score),
          reason: reasons.join('；') || '基本匹配'
        };
      });

      // 过滤掉分数太低的（低于60分）
      const filtered = matchedTeachers.filter(t => t.matchScore >= 60);

      // 按分数排序
      filtered.sort((a, b) => b.matchScore - a.matchScore);

      // 返回前5个
      return {
        success: true,
        matchedTeachers: filtered.slice(0, 5),
        totalTeachers: allTeachers.length
      };
    } catch (error) {
      console.error('AI匹配教师失败:', error);
      throw error;
    }
  }

  /**
   * 为老师匹配学生
   * @param {Object} teacherInfo - 教师信息 { subject, gradeRange, experience, availability, introduction }
   */
  async matchStudentsForTeacher(teacherInfo) {
    try {
      const allStudents = await this.getAllStudents();

      // 计算每个学生的匹配分数
      const matchedStudents = allStudents.map(student => {
        let score = 0;
        let reasons = [];

        // 1. 年级范围匹配 (40%)
        if (teacherInfo.gradeRange && student.grade) {
          const gradeMatch = this.checkGradeRangeMatch(student.grade, teacherInfo.gradeRange);
          if (gradeMatch) {
            score += 40;
            reasons.push(`年级在您的教学范围内(${student.grade})`);
          }
        }

        // 2. 学习需求与教师科目匹配 (30%)
        if (student.learning_needs && teacherInfo.subject) {
          const needsLower = student.learning_needs.toLowerCase();
          const subjectLower = teacherInfo.subject.toLowerCase();
          
          if (needsLower.includes(subjectLower)) {
            score += 30;
            reasons.push(`学习需求包含${teacherInfo.subject}`);
          } else if (needsLower.includes('数学') && teacherInfo.subject === '数学') {
            score += 30;
            reasons.push('需要数学辅导');
          } else if (needsLower.includes('语文') && teacherInfo.subject === '语文') {
            score += 30;
            reasons.push('需要语文辅导');
          } else if (needsLower.includes('英语') && teacherInfo.subject === '英语') {
            score += 30;
            reasons.push('需要英语辅导');
          }
        }

        // 3. 教师经验与学生需求匹配 (20%)
        const expYears = this.parseExperience(teacherInfo.experience);
        if (expYears >= 5) {
          score += 20;
          reasons.push('教师经验丰富，能提供高质量辅导');
        } else if (expYears >= 3) {
          score += 15;
        } else if (expYears >= 1) {
          score += 10;
        }

        // 4. 教学风格匹配 (10%)
        if (teacherInfo.teachingStyle) {
          score += 10;
          reasons.push(`教学风格：${teacherInfo.teachingStyle}`);
        }

        // 5. 个人简介吸引力 (10%) - 如果教师填写了简介
        if (teacherInfo.introduction && teacherInfo.introduction.length > 20) {
          score += 10;
          reasons.push('教师有详细的教学介绍');
        }

        return {
          ...student,
          matchScore: Math.round(score),
          reason: reasons.join('；') || '基本匹配'
        };
      });

      // 过滤掉分数太低的（低于50分）
      const filtered = matchedStudents.filter(s => s.matchScore >= 50);

      // 按分数排序
      filtered.sort((a, b) => b.matchScore - a.matchScore);

      // 返回前10个
      return {
        success: true,
        matchedStudents: filtered.slice(0, 10),
        totalStudents: allStudents.length
      };
    } catch (error) {
      console.error('AI匹配学生失败:', error);
      throw error;
    }
  }

  /**
   * 从学习需求中提取科目关键词
   */
  extractSubjects(learningNeeds) {
    if (!learningNeeds) return [];
    
    const subjects = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
    const found = [];
    
    subjects.forEach(subject => {
      if (learningNeeds.includes(subject)) {
        found.push(subject);
      }
    });
    
    return found;
  }

  /**
   * 解析教学经验为年数
   */
  parseExperience(experience) {
    if (!experience) return 0;
    
    if (experience.includes('5年以上')) return 6;
    if (experience.includes('3-5年')) return 4;
    if (experience.includes('1-3年')) return 2;
    if (experience.includes('1年以下')) return 0.5;
    
    // 尝试提取数字
    const match = experience.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 检查性格匹配
   * @param {string} expectedPersonality - 学生期望的性格
   * @param {string} teacherIntroduction - 教师简介
   * @returns {boolean} 是否匹配
   */
  checkPersonalityMatch(expectedPersonality, teacherIntroduction) {
    if (!expectedPersonality || !teacherIntroduction) return false;
    
    const expected = expectedPersonality.toLowerCase();
    const intro = teacherIntroduction.toLowerCase();
    
    // 常见性格关键词
    const personalityKeywords = [
      '耐心', '细致', '幽默', '风趣', '严格', '认真',
      '温和', '亲切', '活泼', '开朗', '严谨', '负责',
      '专业', '热情', '细心', '温柔', '严厉'
    ];
    
    // 检查是否有共同的关键词
    let matchCount = 0;
    personalityKeywords.forEach(keyword => {
      if (expected.includes(keyword) && intro.includes(keyword)) {
        matchCount++;
      }
    });
    
    return matchCount >= 1; // 至少有一个共同关键词即认为匹配
  }

  /**
   * 检查年级范围匹配
   * @param {string} studentGrade - 学生年级
   * @param {string} gradeRange - 教师目标年级范围
   * @returns {boolean} 是否匹配
   */
  checkGradeRangeMatch(studentGrade, gradeRange) {
    if (!studentGrade || !gradeRange) return false;
    
    // 定义年级范围映射
    const gradeRanges = {
      '一到三年级': ['一年级', '二年级', '三年级'],
      '四到六年级': ['四年级', '五年级', '六年级'],
      '初一到初三': ['初一', '初二', '初三'],
      '全年级': ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三']
    };
    
    const grades = gradeRanges[gradeRange];
    if (!grades) return false;
    
    return grades.includes(studentGrade);
  }
}

module.exports = new AIService();
