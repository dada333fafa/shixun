# AI智能匹配功能迁移说明

## 功能概述

已将管理员端的AI配置功能迁移到学生端和教师端，实现：
- **学生端**：输入年级和学习需求后，AI智能匹配适合的老师
- **教师端**：输入教学信息后，AI智能匹配适合的学生
- **统一后端**：所有前端共用3000端口的单一后端
- **统一数据库**：所有数据存储在 `rural_education_platform` 数据库

## 主要修改内容

### 1. 前端界面修改

#### 学生端 (AIRecommendation.vue)
- ✅ 移除了心理状态字段（按需求不需要）
- ✅ 添加年级选择器（一年级到初三）
- ✅ 添加学习需求文本输入框
- ✅ 显示匹配结果：教师姓名、科目、教育背景、教学经验、评分、匹配度
- ✅ 添加"申请辅导"按钮，可直接向匹配的教师发送请求

#### 教师端 (AIMatch.vue)
- ✅ 调整表单字段为中文选项
- ✅ 添加更多科目选项（数学、语文、英语、物理、化学、生物、历史、地理、政治）
- ✅ 添加更多年级选项（一年级到初三）
- ✅ 显示匹配结果：学生姓名、年级、学习需求、匹配度
- ✅ 添加"邀请辅导"按钮，可向匹配的学生发送邀请

### 2. 后端服务创建

#### 新建文件
- `teacher_system/xiangcun/hou/services/aiService.js` - AI匹配核心服务
  - `matchTeachersForStudent()` - 为学生匹配老师
  - `matchStudentsForTeacher()` - 为老师匹配学生
  - 使用加权算法计算匹配度（科目、评分、经验、教育背景）

- `teacher_system/xiangcun/hou/routes/aiRoutes.js` - AI路由
  - `POST /api/v1/ai/match-student` - 学生匹配教师接口
  - `POST /api/v1/ai/match-teacher` - 教师匹配学生接口
  - `GET /api/v1/ai/recommendations` - 获取推荐列表

#### 修改文件
- `teacher_system/xiangcun/hou/app.js`
  - 添加了 `/api/v1/ai` 路由注册

- `teacher_system/xiangcun/hou/routes/matchRoutes.js`
  - 添加了 `POST /api/matches/request-from-teacher` 接口
  - 支持教师主动向学生发起辅导邀请

### 3. 匹配算法说明

#### 学生匹配教师的评分规则（总分100分）
1. **科目匹配** (40%) - 从学习需求中提取科目关键词，与教师科目匹配
2. **教师评分** (30%) - 基于教师的历史评分（满分5分）
3. **教学经验** (20%) - 根据教学年限评分
4. **教育背景** (10%) - 硕士/博士 > 本科 > 其他

#### 教师匹配学生的评分规则（总分100分）
1. **年级匹配** (40%) - 学生年级与教师目标年级是否一致
2. **学习需求匹配** (35%) - 学生学习需求中是否包含教师教授的科目
3. **教师经验** (25%) - 教师经验越丰富，匹配度越高

### 4. 数据库表结构

所有数据存储在 `rural_education_platform` 数据库中，主要使用的表：

- `users` - 用户表（包含学生、教师、家长、管理员）
- `students` - 学生信息表（grade, learning_needs, psychological_status等）
- `teachers` - 教师信息表（subject, education, experience, rating等）
- `teacher_student_matches` - 师生匹配表（记录辅导请求和匹配状态）
- `ai_recommendations` - AI推荐记录表（可选，用于保存历史推荐）

## 启动和测试指南

### 1. 启动后端服务器

```bash
cd teacher_system/xiangcun/hou
npm install
node app.js
```

服务器将在 **端口 3000** 启动。

### 2. 启动前端应用

需要启动四个前端应用：

#### 学生端
```bash
cd student_stystem/vallege_student_help_qian
npm install
npm run dev
```
访问：http://localhost:5173（或其他Vite分配的端口）

#### 教师端
```bash
cd teacher_system/xiangcun/qian
npm install
npm run dev
```
访问：http://localhost:5174（或其他Vite分配的端口）

#### 家长端
```bash
cd Parent_system/parent_qianduan
npm install
npm run dev
```

#### 管理员端
```bash
cd manager_system/manager_system/qian_duan/vue-project
npm install
npm run dev
```

### 3. 测试流程

#### 测试学生端AI匹配
1. 使用学生账号登录学生端
2. 进入"AI推荐"页面
3. 选择年级（如：三年级）
4. 输入学习需求（如：数学基础薄弱，需要加强练习）
5. 点击"开始AI匹配"
6. 查看匹配结果，点击"申请辅导"向教师发送请求

#### 测试教师端AI匹配
1. 使用教师账号登录教师端
2. 进入"AI匹配"页面
3. 选择教授科目（如：数学）
4. 选择目标年级（如：三年级）
5. 选择教学经验（如：3-5年）
6. 输入可辅导时间（可选）
7. 点击"开始AI匹配"
8. 查看匹配结果，点击"邀请辅导"向学生发送邀请

#### 测试匹配请求处理
1. 学生或教师发送请求后
2. 对方会在"匹配管理"页面收到通知
3. 可以接受或拒绝请求
4. 如果有家长关联，还需要家长确认

### 4. API接口测试

可以使用Postman或curl测试API：

#### 学生匹配教师
```bash
curl -X POST http://localhost:3000/api/v1/ai/match-student \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN" \
  -d '{
    "grade": "三年级",
    "learningNeeds": "数学基础薄弱，需要提高成绩"
  }'
```

#### 教师匹配学生
```bash
curl -X POST http://localhost:3000/api/v1/ai/match-teacher \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject": "数学",
    "grade": "三年级",
    "experience": "3-5年",
    "availability": "周末上午"
  }'
```

## 注意事项

1. **认证Token**：所有AI匹配接口都需要有效的认证token
   - 学生端使用 `x-auth-token` header
   - 教师端使用 `Authorization: Bearer TOKEN` header

2. **数据完整性**：确保数据库中有足够的学生和教师数据，否则匹配结果可能为空

3. **匹配阈值**：
   - 学生匹配教师：只显示匹配度 >= 60分的教师
   - 教师匹配学生：只显示匹配度 >= 50分的学生

4. **心理状态字段**：按需求已移除，学生在匹配时无需输入心理状态信息

5. **统一架构**：
   - 单一后端：3000端口
   - 四个前端：各自独立运行
   - 统一数据库：rural_education_platform

## 故障排查

### 问题1：匹配结果为空
- 检查数据库中是否有教师/学生数据
- 检查输入的科目、年级是否与数据库中的数据匹配
- 查看后端控制台日志，确认匹配算法执行情况

### 问题2：认证失败
- 确认用户已正确登录
- 检查localStorage中是否有token
- 确认token未过期

### 问题3：API调用失败
- 确认后端服务器正在运行（端口3000）
- 检查浏览器控制台的Network标签，查看具体错误
- 确认API路径正确：`/api/v1/ai/match-student` 或 `/api/v1/ai/match-teacher`

## 后续优化建议

1. **引入真实AI模型**：当前使用规则-based匹配，可以集成阿里云百炼或其他AI服务
2. **保存匹配历史**：将每次匹配结果保存到 `ai_recommendations` 表
3. **个性化推荐**：基于学生的学习历史和教师的教学记录进行更精准的匹配
4. **实时推送**：当有新的匹配时，通过WebSocket实时通知用户
5. **匹配反馈**：允许用户对匹配结果进行反馈，优化算法

---

**完成时间**: 2026-04-24  
**版本**: v1.0
