# AI匹配专用数据表说明

## 📋 概述

创建了两个独立的数据库表，专门用于AI智能匹配功能，**完全不影响现有的 `teachers` 和 `students` 表**。

## 🗄️ 新建的表

### 1. ai_teacher_profiles (AI教师档案表)
**用途**: 学生端AI匹配时读取的教师信息

**字段说明**:
- `id` - 主键
- `name` - 教师姓名
- `subject` - 教授科目（数学、语文、英语等）
- `education` - 教育背景（本科、硕士、博士）
- `experience` - 教学经验（1年以下、1-3年、3-5年、5年以上）
- `rating` - 教师评分（0-5分）
- `introduction` - **个人简介**（用于性格匹配的关键字段）
- `teaching_style` - 教学风格关键词（耐心细致、幽默风趣等）
- `specialties` - 专长领域
- `available_grades` - 可辅导年级范围（一到三年级、四到六年级等）
- `max_students` - 最大学生数
- `is_active` - 是否活跃

**索引**:
- `idx_subject` - 科目索引
- `idx_rating` - 评分索引
- `idx_active` - 活跃状态索引

### 2. ai_student_profiles (AI学生档案表)
**用途**: 教师端AI匹配时读取的学生信息

**字段说明**:
- `id` - 主键
- `name` - 学生姓名
- `grade` - 年级（一年级到初三）
- `school` - 学校
- `learning_needs` - **学习需求描述**（AI匹配关键字段）
- `weak_subjects` - 薄弱科目
- `learning_goals` - 学习目标
- `preferred_teacher_personality` - **期望教师性格**（用于性格匹配）
- `learning_style` - 学习风格（视觉型、听觉型、动觉型）
- `is_active` - 是否活跃

**索引**:
- `idx_grade` - 年级索引
- `idx_active` - 活跃状态索引

## 📊 测试数据

### 教师数据 (60条)
按科目分布：
- 数学教师: 15人
- 语文教师: 15人
- 英语教师: 15人
- 其他科目教师: 15人（物理、化学、生物、历史、地理、政治）

**特点**:
- 评分范围: 4.0 - 5.0
- 经验分布: 1年以下到5年以上
- 教育背景: 本科、硕士、博士
- 年级覆盖: 一到三年级、四到六年级、初一到初三、全年级
- 教学风格多样: 耐心细致、幽默风趣、严格认真、温和亲切等

### 学生数据 (60条)
按年级分布：
- 一到三年级: 20人
- 四到六年级: 20人
- 初一到初三: 20人

**特点**:
- 学习需求详细描述
- 薄弱科目明确标注
- 期望教师性格多样化
- 学习风格分类（视觉型、听觉型、动觉型）

## 🔧 使用方法

### 1. 执行SQL脚本
```bash
# 连接到MySQL数据库
mysql -u root -p

# 执行SQL脚本
source d:/shixun/vallege_studetn/teacher_system/xiangcun/hou/ai_match_data.sql
```

或者在MySQL客户端中直接运行该文件。

### 2. 验证数据
```sql
-- 查看教师总数
SELECT COUNT(*) FROM ai_teacher_profiles;  -- 应该返回 60

-- 查看学生总数
SELECT COUNT(*) FROM ai_student_profiles;  -- 应该返回 60

-- 查看数学教师
SELECT name, rating, experience FROM ai_teacher_profiles WHERE subject = '数学';

-- 查看三年级学生
SELECT name, learning_needs FROM ai_student_profiles WHERE grade = '三年级';
```

### 3. 更新后端AI服务

需要修改 `aiService.js`，让它从新表读取数据：

```javascript
// 原来的方法
async getAllTeachers() {
  const teachers = await Teacher.find().populate('user', 'name email phone');
  // ...
}

// 改为从新表读取
async getAllTeachers() {
  // 使用原生SQL查询或创建新的Mongoose模型
  const teachers = await db.collection('ai_teacher_profiles').find({ is_active: true }).toArray();
  return teachers.map(teacher => ({
    id: teacher.id,
    name: teacher.name,
    subject: teacher.subject,
    education: teacher.education,
    experience: teacher.experience,
    introduction: teacher.introduction,
    rating: teacher.rating,
    // ...
  }));
}
```

## ⚠️ 重要说明

### ✅ 不会影响现有功能
1. **独立表结构**: 新表与现有的 `teachers` 和 `students` 表完全独立
2. **无外键关联**: 新表不引用现有表的任何字段
3. **现有数据不变**: 所有已有的辅导请求、匹配记录、聊天记录等都不受影响
4. **并行运行**: 可以同时使用新旧两套数据

### 🎯 优势
1. **专用优化**: 表结构专门为AI匹配优化，查询效率更高
2. **数据隔离**: AI测试数据不会污染生产数据
3. **灵活管理**: 可以单独更新AI匹配数据，不影响业务数据
4. **易于扩展**: 可以轻松添加更多AI相关字段

### 📝 后续工作
1. **更新后端代码**: 修改 `aiService.js` 从新表读取数据
2. **创建Mongoose模型**: 为两个新表创建对应的Model
3. **测试匹配效果**: 验证AI匹配是否能正常工作
4. **数据维护**: 定期更新和维护AI匹配数据

## 🚀 下一步操作

1. **执行SQL脚本**创建表和插入数据
2. **创建Mongoose模型**文件：
   - `models/AiTeacherProfile.js`
   - `models/AiStudentProfile.js`
3. **更新AI服务**从新表读取数据
4. **测试匹配功能**确保正常工作

---

**创建时间**: 2026-04-24  
**版本**: v1.0  
**状态**: ✅ SQL脚本已创建，待执行
