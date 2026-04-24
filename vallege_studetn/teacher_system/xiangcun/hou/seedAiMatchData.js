/**
 * AI匹配测试数据种子脚本
 * 用于向 MongoDB 的 rural_education_platform 数据库中插入AI匹配专用的测试数据
 * 
 * 使用方法:
 * node seedAiMatchData.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 数据库连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_education_platform';

// 定义AI教师档案Schema
const aiTeacherProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  education: String,
  experience: String,
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  introduction: String,
  teaching_style: String,
  specialties: String,
  available_grades: String,
  max_students: { type: Number, default: 10 },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'ai_teacher_profiles'
});

// 定义AI学生档案Schema
const aiStudentProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: { type: String, required: true },
  school: String,
  learning_needs: String,
  weak_subjects: String,
  learning_goals: String,
  preferred_teacher_personality: String,
  learning_style: String,
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'ai_student_profiles'
});

const AiTeacherProfile = mongoose.model('AiTeacherProfile', aiTeacherProfileSchema);
const AiStudentProfile = mongoose.model('AiStudentProfile', aiStudentProfileSchema);

// 60条教师数据
const teachersData = [
  // 数学教师 (15人)
  { name: '王老师', subject: '数学', education: '本科', experience: '3-5年', rating: 4.5, introduction: '我有丰富的数学教学经验，教学风格耐心细致，善于用生活中的例子解释抽象概念。注重培养学生的逻辑思维能力和解题技巧。', teaching_style: '耐心细致', specialties: '小学数学、初中代数', available_grades: '一到三年级', max_students: 8 },
  { name: '李老师', subject: '数学', education: '硕士', experience: '5年以上', rating: 4.8, introduction: '专注于数学思维训练，教学严谨认真。擅长启发式教学，引导学生自主思考。多次获得优秀教师称号。', teaching_style: '严格认真', specialties: '奥数、几何', available_grades: '四到六年级', max_students: 10 },
  { name: '张老师', subject: '数学', education: '本科', experience: '1-3年', rating: 4.2, introduction: '年轻有活力的数学老师，教学风格幽默风趣，能让枯燥的数学变得有趣。善于与学生沟通，建立良好师生关系。', teaching_style: '幽默风趣', specialties: '基础数学', available_grades: '一到三年级', max_students: 6 },
  { name: '陈老师', subject: '数学', education: '硕士', experience: '5年以上', rating: 4.9, introduction: '资深数学教师，教学经验丰富。温和亲切的教学风格深受学生喜爱。擅长因材施教，帮助每个学生找到适合自己的学习方法。', teaching_style: '温和亲切', specialties: '数学思维、应用题', available_grades: '全年级', max_students: 12 },
  { name: '刘老师', subject: '数学', education: '本科', experience: '3-5年', rating: 4.3, introduction: '认真负责的数学老师，注重基础知识的巩固。教学风格严谨，作业批改细致。相信勤能补拙，帮助学生稳步提升。', teaching_style: '严谨负责', specialties: '基础巩固', available_grades: '四到六年级', max_students: 8 },
  { name: '赵老师', subject: '数学', education: '博士', experience: '5年以上', rating: 5.0, introduction: '数学博士，专业功底深厚。教学热情高涨，善于激发学生学习兴趣。培养多名学生在数学竞赛中获奖。', teaching_style: '专业热情', specialties: '竞赛数学', available_grades: '初一到初三', max_students: 10 },
  { name: '孙老师', subject: '数学', education: '本科', experience: '1-3年', rating: 4.0, introduction: '细心耐心的数学老师，特别擅长辅导基础薄弱的学生。教学循序渐进，让学生建立信心。', teaching_style: '细心温柔', specialties: '补差辅导', available_grades: '一到三年级', max_students: 6 },
  { name: '周老师', subject: '数学', education: '硕士', experience: '3-5年', rating: 4.6, introduction: '开朗活泼的数学教师，课堂氛围轻松愉快。善于用游戏化教学方式，让学生在快乐中学习数学。', teaching_style: '活泼开朗', specialties: '趣味数学', available_grades: '一到三年级', max_students: 8 },
  { name: '吴老师', subject: '数学', education: '本科', experience: '5年以上', rating: 4.7, introduction: '严厉但公平的数学老师，对学生要求严格但充满关爱。注重学习习惯的培养，帮助学生养成良好学习方法。', teaching_style: '严厉关爱', specialties: '习惯培养', available_grades: '四到六年级', max_students: 10 },
  { name: '郑老师', subject: '数学', education: '硕士', experience: '3-5年', rating: 4.4, introduction: '专业的数学教师，教学思路清晰。善于总结归纳，帮助学生建立知识体系。耐心解答学生疑问。', teaching_style: '专业耐心', specialties: '知识梳理', available_grades: '初一到初三', max_students: 8 },
  { name: '钱老师', subject: '数学', education: '本科', experience: '1-3年', rating: 4.1, introduction: '热情洋溢的数学老师，对教学充满激情。善于鼓励学生，帮助学生克服数学恐惧心理。', teaching_style: '热情鼓励', specialties: '心理疏导', available_grades: '一到三年级', max_students: 6 },
  { name: '冯老师', subject: '数学', education: '硕士', experience: '5年以上', rating: 4.8, introduction: '经验丰富的数学教师，教学方法灵活多样。根据学生特点调整教学策略，效果显著。', teaching_style: '灵活多样', specialties: '个性化教学', available_grades: '全年级', max_students: 12 },
  { name: '褚老师', subject: '数学', education: '本科', experience: '3-5年', rating: 4.3, introduction: '温和耐心的数学老师，特别受女生欢迎。善于倾听学生想法，尊重学生个性发展。', teaching_style: '温和耐心', specialties: '个性发展', available_grades: '四到六年级', max_students: 8 },
  { name: '卫老师', subject: '数学', education: '博士', experience: '5年以上', rating: 4.9, introduction: '学术型数学教师，理论功底扎实。教学深入浅出，能将复杂问题简单化。培养学生数学思维能力。', teaching_style: '学术严谨', specialties: '思维训练', available_grades: '初一到初三', max_students: 10 },
  { name: '蒋老师', subject: '数学', education: '本科', experience: '1-3年', rating: 4.2, introduction: '年轻有为的数学老师，善于运用多媒体教学。课堂生动有趣，学生参与度高。', teaching_style: '生动有趣', specialties: '多媒体教学', available_grades: '一到三年级', max_students: 6 },

  // 语文教师 (15人)
  { name: '杨老师', subject: '语文', education: '硕士', experience: '5年以上', rating: 4.7, introduction: '资深语文教师，文学功底深厚。教学风格温文尔雅，善于引导学生感受文字之美。注重阅读和写作能力培养。', teaching_style: '温文尔雅', specialties: '阅读写作', available_grades: '四到六年级', max_students: 10 },
  { name: '朱老师', subject: '语文', education: '本科', experience: '3-5年', rating: 4.4, introduction: '热情开朗的语文老师，课堂气氛活跃。善于讲故事，让古文变得生动有趣。学生都很喜欢上我的课。', teaching_style: '热情开朗', specialties: '古文教学', available_grades: '一到三年级', max_students: 8 },
  { name: '秦老师', subject: '语文', education: '硕士', experience: '5年以上', rating: 4.8, introduction: '专业的语文教师，擅长作文指导。教学认真细致，批改作文非常用心。帮助多名学生在作文比赛中获奖。', teaching_style: '认真细致', specialties: '作文指导', available_grades: '全年级', max_students: 12 },
  { name: '尤老师', subject: '语文', education: '本科', experience: '1-3年', rating: 4.1, introduction: '年轻活力的语文老师，善于与学生打成一片。教学风格轻松自然，让学生在愉悦中学习语文。', teaching_style: '轻松自然', specialties: '互动教学', available_grades: '一到三年级', max_students: 6 },
  { name: '许老师', subject: '语文', education: '硕士', experience: '3-5年', rating: 4.6, introduction: '严谨认真的语文教师，注重基础知识。教学有条理，知识点讲解清晰。帮助学生打牢语文基础。', teaching_style: '严谨认真', specialties: '基础教学', available_grades: '四到六年级', max_students: 8 },
  { name: '何老师', subject: '语文', education: '博士', experience: '5年以上', rating: 4.9, introduction: '文学博士，文化底蕴深厚。教学风格儒雅，善于引经据典。培养学生的人文素养和批判性思维。', teaching_style: '儒雅博学', specialties: '人文素养', available_grades: '初一到初三', max_students: 10 },
  { name: '吕老师', subject: '语文', education: '本科', experience: '3-5年', rating: 4.3, introduction: '耐心细致的语文老师，特别擅长辅导阅读理解。教学方法灵活，能针对不同学生采用不同策略。', teaching_style: '耐心细致', specialties: '阅读理解', available_grades: '四到六年级', max_students: 8 },
  { name: '施老师', subject: '语文', education: '硕士', experience: '5年以上', rating: 4.7, introduction: '经验丰富的语文教师，教学成果显著。温和亲切的教学风格，深受学生和家长信赖。', teaching_style: '温和亲切', specialties: '综合提升', available_grades: '全年级', max_students: 12 },
  { name: '张老师2', subject: '语文', education: '本科', experience: '1-3年', rating: 4.0, introduction: '活泼可爱的语文老师，善于调动课堂气氛。通过角色扮演等方式，让语文学习变得有趣。', teaching_style: '活泼可爱', specialties: '情境教学', available_grades: '一到三年级', max_students: 6 },
  { name: '孔老师', subject: '语文', education: '硕士', experience: '3-5年', rating: 4.5, introduction: '专业的语文教师，注重传统文化教育。教学严谨，要求学生规范书写。培养学生良好的语文素养。', teaching_style: '严谨规范', specialties: '传统文化', available_grades: '四到六年级', max_students: 8 },
  { name: '曹老师', subject: '语文', education: '本科', experience: '5年以上', rating: 4.6, introduction: '资深语文教师，教学经验丰富。教学风格平易近人，善于发现学生闪光点并加以鼓励。', teaching_style: '平易近人', specialties: '激励教学', available_grades: '全年级', max_students: 10 },
  { name: '严老师', subject: '语文', education: '硕士', experience: '3-5年', rating: 4.4, introduction: '严格的语文老师，对学生要求高但充满爱心。注重细节，培养学生良好的学习习惯。', teaching_style: '严格爱心', specialties: '习惯养成', available_grades: '初一到初三', max_students: 8 },
  { name: '华老师', subject: '语文', education: '本科', experience: '1-3年', rating: 4.2, introduction: '热情耐心的语文教师，善于与学生沟通。教学循序渐进，帮助学生逐步提高语文水平。', teaching_style: '热情耐心', specialties: '循序渐进', available_grades: '一到三年级', max_students: 6 },
  { name: '金老师', subject: '语文', education: '博士', experience: '5年以上', rating: 4.8, introduction: '学术型语文教师，研究能力强。教学深入浅出，能将复杂的文学理论讲得通俗易懂。', teaching_style: '学术通俗', specialties: '文学鉴赏', available_grades: '初一到初三', max_students: 10 },
  { name: '魏老师', subject: '语文', education: '硕士', experience: '3-5年', rating: 4.5, introduction: '温柔的语文老师，特别受学生喜爱。教学细腻，关注每个学生的情感体验。营造温馨的课堂氛围。', teaching_style: '温柔细腻', specialties: '情感教育', available_grades: '四到六年级', max_students: 8 },

  // 英语教师 (15人)
  { name: '陶老师', subject: '英语', education: '硕士', experience: '5年以上', rating: 4.7, introduction: '资深英语教师，口语标准流利。教学风格活泼，善于创设语言环境。培养学生英语思维和表达能力。', teaching_style: '活泼生动', specialties: '口语交际', available_grades: '全年级', max_students: 12 },
  { name: '姜老师', subject: '英语', education: '本科', experience: '3-5年', rating: 4.3, introduction: '年轻有活力的英语老师，善于运用多媒体教学。课堂趣味性强，学生参与度高。', teaching_style: '趣味性强', specialties: '多媒体', available_grades: '一到三年级', max_students: 8 },
  { name: '戚老师', subject: '英语', education: '硕士', experience: '5年以上', rating: 4.8, introduction: '专业的英语教师，语法讲解清晰。教学严谨认真，注重基础知识的掌握。帮助学生建立扎实的英语基础。', teaching_style: '严谨认真', specialties: '语法基础', available_grades: '四到六年级', max_students: 10 },
  { name: '谢老师', subject: '英语', education: '本科', experience: '1-3年', rating: 4.1, introduction: '热情开朗的英语老师，善于鼓励学生。教学风格轻松，帮助学生克服英语学习恐惧。', teaching_style: '热情鼓励', specialties: '心理建设', available_grades: '一到三年级', max_students: 6 },
  { name: '邹老师', subject: '英语', education: '硕士', experience: '3-5年', rating: 4.5, introduction: '耐心的英语教师，特别擅长辅导基础薄弱的学生。教学细致入微，不厌其烦地解答学生疑问。', teaching_style: '耐心细致', specialties: '补差辅导', available_grades: '四到六年级', max_students: 8 },
  { name: '喻老师', subject: '英语', education: '博士', experience: '5年以上', rating: 4.9, introduction: '英语博士，专业功底深厚。教学风格儒雅，注重文化内涵。培养学生的跨文化交际能力。', teaching_style: '儒雅专业', specialties: '跨文化', available_grades: '初一到初三', max_students: 10 },
  { name: '柏老师', subject: '英语', education: '本科', experience: '3-5年', rating: 4.2, introduction: '温和亲切的英语老师，善于与学生建立信任关系。教学循序渐进，让学生稳步提升。', teaching_style: '温和亲切', specialties: '信任建立', available_grades: '一到三年级', max_students: 6 },
  { name: '水老师', subject: '英语', education: '硕士', experience: '5年以上', rating: 4.6, introduction: '经验丰富的英语教师，教学方法多样。善于因材施教，根据学生特点制定个性化方案。', teaching_style: '多样灵活', specialties: '个性化', available_grades: '全年级', max_students: 12 },
  { name: '窦老师', subject: '英语', education: '本科', experience: '1-3年', rating: 4.0, introduction: '活泼有趣的英语老师，善于设计游戏化教学活动。让学生在玩中学，学中玩。', teaching_style: '活泼有趣', specialties: '游戏教学', available_grades: '一到三年级', max_students: 6 },
  { name: '章老师', subject: '英语', education: '硕士', experience: '3-5年', rating: 4.4, introduction: '认真的英语教师，注重听说读写全面发展。教学有条理，知识点系统性强。', teaching_style: '认真系统', specialties: '全面发展', available_grades: '四到六年级', max_students: 8 },
  { name: '云老师', subject: '英语', education: '本科', experience: '5年以上', rating: 4.7, introduction: '资深英语教师，教学成果显著。教学风格平易近人，深受学生喜爱。', teaching_style: '平易近人', specialties: '成果导向', available_grades: '全年级', max_students: 10 },
  { name: '苏老师', subject: '英语', education: '硕士', experience: '3-5年', rating: 4.5, introduction: '专业的英语教师，发音标准。教学严谨，注重语音语调训练。帮助学生练就地道英语。', teaching_style: '严谨专业', specialties: '语音训练', available_grades: '初一到初三', max_students: 8 },
  { name: '潘老师', subject: '英语', education: '本科', experience: '1-3年', rating: 4.2, introduction: '热情的英语老师，课堂气氛活跃。善于运用英文歌曲、电影等素材，激发学习兴趣。', teaching_style: '热情活跃', specialties: '兴趣激发', available_grades: '一到三年级', max_students: 6 },
  { name: '葛老师', subject: '英语', education: '博士', experience: '5年以上', rating: 4.8, introduction: '学术型英语教师，研究能力强。教学深入浅出，能将复杂的语法讲得简单易懂。', teaching_style: '学术通俗', specialties: '语法解析', available_grades: '初一到初三', max_students: 10 },
  { name: '奚老师', subject: '英语', education: '硕士', experience: '3-5年', rating: 4.4, introduction: '细心的英语教师，关注每个学生的学习进度。教学耐心，及时给予反馈和指导。', teaching_style: '细心耐心', specialties: '及时反馈', available_grades: '四到六年级', max_students: 8 },

  // 其他科目教师 (15人)
  { name: '范老师', subject: '物理', education: '硕士', experience: '5年以上', rating: 4.6, introduction: '资深物理教师，实验能力强。教学严谨，注重理论与实践结合。培养学生科学探究精神。', teaching_style: '严谨实践', specialties: '实验教学', available_grades: '初一到初三', max_students: 10 },
  { name: '彭老师', subject: '化学', education: '本科', experience: '3-5年', rating: 4.3, introduction: '年轻的化学老师，善于做趣味实验。教学风格生动，让化学变得有趣。', teaching_style: '生动有趣', specialties: '趣味实验', available_grades: '初一到初三', max_students: 8 },
  { name: '鲁老师', subject: '生物', education: '硕士', experience: '5年以上', rating: 4.7, introduction: '专业的生物教师，知识面广。教学热情，善于联系生活实际。培养学生对生命科学的兴趣。', teaching_style: '热情广博', specialties: '生活联系', available_grades: '初一到初三', max_students: 10 },
  { name: '韦老师', subject: '历史', education: '本科', experience: '3-5年', rating: 4.4, introduction: '博学的历史老师，故事讲得好。教学风格幽默，让历史课变得生动有趣。', teaching_style: '幽默博学', specialties: '故事教学', available_grades: '初一到初三', max_students: 8 },
  { name: '昌老师', subject: '地理', education: '硕士', experience: '5年以上', rating: 4.5, introduction: '资深地理教师，地图运用熟练。教学严谨，注重空间思维培养。', teaching_style: '严谨专业', specialties: '空间思维', available_grades: '初一到初三', max_students: 10 },
  { name: '马老师', subject: '政治', education: '本科', experience: '3-5年', rating: 4.2, introduction: '耐心的政治老师，善于引导学生思考。教学风格平和，注重价值观培养。', teaching_style: '耐心平和', specialties: '价值引导', available_grades: '初一到初三', max_students: 8 },
  { name: '苗老师', subject: '数学', education: '硕士', experience: '1-3年', rating: 4.1, introduction: '年轻数学教师，思维活跃。教学创新，善于运用新技术辅助教学。', teaching_style: '创新活跃', specialties: '技术融合', available_grades: '四到六年级', max_students: 6 },
  { name: '凤老师', subject: '语文', education: '本科', experience: '1-3年', rating: 4.0, introduction: '温柔的语文老师，特别有亲和力。教学细腻，关注学生情感发展。', teaching_style: '温柔细腻', specialties: '情感关怀', available_grades: '一到三年级', max_students: 6 },
  { name: '花老师', subject: '英语', education: '硕士', experience: '3-5年', rating: 4.5, introduction: '专业的英语教师，国际视野开阔。教学风格开放，注重文化交流。', teaching_style: '开放专业', specialties: '国际视野', available_grades: '四到六年级', max_students: 8 },
  { name: '方老师', subject: '物理', education: '本科', experience: '5年以上', rating: 4.6, introduction: '经验丰富的物理教师，解题技巧多。教学实用，注重应试能力培养。', teaching_style: '实用高效', specialties: '应试技巧', available_grades: '初一到初三', max_students: 10 },
  { name: '俞老师', subject: '化学', education: '硕士', experience: '3-5年', rating: 4.4, introduction: '认真的化学教师，实验操作规范。教学严谨，注重安全教育。', teaching_style: '严谨规范', specialties: '安全实验', available_grades: '初一到初三', max_students: 8 },
  { name: '任老师', subject: '生物', education: '本科', experience: '1-3年', rating: 4.1, introduction: '活泼的生物老师，善于户外教学。教学风格轻松，让学生亲近自然。', teaching_style: '活泼轻松', specialties: '户外教学', available_grades: '四到六年级', max_students: 6 },
  { name: '袁老师', subject: '历史', education: '硕士', experience: '5年以上', rating: 4.7, introduction: '资深历史教师，史料丰富。教学深刻，注重历史思维培养。', teaching_style: '深刻专业', specialties: '历史思维', available_grades: '初一到初三', max_students: 10 },
  { name: '柳老师', subject: '地理', education: '本科', experience: '3-5年', rating: 4.3, introduction: '热情的地理老师，善于运用GIS技术。教学现代，注重实践能力。', teaching_style: '热情现代', specialties: '技术应用', available_grades: '初一到初三', max_students: 8 },
  { name: '丰老师', subject: '政治', education: '硕士', experience: '5年以上', rating: 4.5, introduction: '专业的政治教师，理论水平高。教学严谨，注重思辨能力培养。', teaching_style: '严谨专业', specialties: '思辨训练', available_grades: '初一到初三', max_students: 10 }
];

// 60条学生数据
const studentsData = [
  // 一到三年级 (20人)
  { name: '小明', grade: '一年级', school: '希望小学', learning_needs: '数学基础薄弱，加减法经常出错，需要加强基础训练', weak_subjects: '数学', learning_goals: '掌握基本运算，建立数学信心', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '小红', grade: '一年级', school: '光明小学', learning_needs: '拼音学习困难，认字速度慢，需要系统的语文基础训练', weak_subjects: '语文', learning_goals: '熟练掌握拼音，提高识字量', preferred_teacher_personality: '温和亲切', learning_style: '听觉型' },
  { name: '小刚', grade: '二年级', school: '育才小学', learning_needs: '英语启蒙阶段，对英语学习有兴趣但缺乏方法', weak_subjects: '英语', learning_goals: '培养英语学习兴趣，掌握基础词汇', preferred_teacher_personality: '幽默风趣', learning_style: '动觉型' },
  { name: '小丽', grade: '二年级', school: '实验小学', learning_needs: '数学应用题理解困难，需要提高阅读理解能力', weak_subjects: '数学', learning_goals: '提高应用题解题能力', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '小强', grade: '三年级', school: '阳光小学', learning_needs: '语文写作能力弱，不知道如何组织语言', weak_subjects: '语文', learning_goals: '提高写作水平，学会表达', preferred_teacher_personality: '鼓励型', learning_style: '视觉型' },
  { name: '小芳', grade: '三年级', school: '希望小学', learning_needs: '英语学习起步晚，需要从头开始系统学习', weak_subjects: '英语', learning_goals: '打好英语基础，跟上课程进度', preferred_teacher_personality: '耐心细致', learning_style: '听觉型' },
  { name: '小军', grade: '一年级', school: '光明小学', learning_needs: '注意力不集中，上课容易走神，需要老师多关注', weak_subjects: '数学,语文', learning_goals: '提高专注力，养成良好学习习惯', preferred_teacher_personality: '严格认真', learning_style: '动觉型' },
  { name: '小燕', grade: '二年级', school: '育才小学', learning_needs: '数学计算速度慢，需要提高计算能力', weak_subjects: '数学', learning_goals: '提高计算速度和准确率', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '小龙', grade: '三年级', school: '实验小学', learning_needs: '语文阅读理解能力差，读不懂文章意思', weak_subjects: '语文', learning_goals: '提高阅读理解能力', preferred_teacher_personality: '温和亲切', learning_style: '听觉型' },
  { name: '小梅', grade: '一年级', school: '阳光小学', learning_needs: '英语口语不敢开口，需要鼓励和帮助', weak_subjects: '英语', learning_goals: '敢于开口说英语，建立自信', preferred_teacher_personality: '鼓励型', learning_style: '动觉型' },
  { name: '小虎', grade: '二年级', school: '希望小学', learning_needs: '数学逻辑思维弱，需要培养思维能力', weak_subjects: '数学', learning_goals: '培养逻辑思维能力', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '小兰', grade: '三年级', school: '光明小学', learning_needs: '语文基础知识不牢固，字词掌握不好', weak_subjects: '语文', learning_goals: '夯实语文基础', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '小波', grade: '一年级', school: '育才小学', learning_needs: '英语学习没有兴趣，需要激发学习动机', weak_subjects: '英语', learning_goals: '培养英语学习兴趣', preferred_teacher_personality: '幽默风趣', learning_style: '动觉型' },
  { name: '小静', grade: '二年级', school: '实验小学', learning_needs: '数学概念理解不清，需要反复讲解', weak_subjects: '数学', learning_goals: '理解数学概念', preferred_teacher_personality: '耐心细致', learning_style: '听觉型' },
  { name: '小峰', grade: '三年级', school: '阳光小学', learning_needs: '语文表达能力弱，说话结巴，需要锻炼', weak_subjects: '语文', learning_goals: '提高语言表达能力', preferred_teacher_personality: '温和亲切', learning_style: '动觉型' },
  { name: '小霞', grade: '一年级', school: '希望小学', learning_needs: '英语听力理解困难，需要加强听力训练', weak_subjects: '英语', learning_goals: '提高英语听力水平', preferred_teacher_personality: '耐心细致', learning_style: '听觉型' },
  { name: '小亮', grade: '二年级', school: '光明小学', learning_needs: '数学做题粗心大意，需要培养细心习惯', weak_subjects: '数学', learning_goals: '养成细心的好习惯', preferred_teacher_personality: '严格认真', learning_style: '视觉型' },
  { name: '小玲', grade: '三年级', school: '育才小学', learning_needs: '语文背诵困难，记忆力需要提高', weak_subjects: '语文', learning_goals: '提高记忆力和背诵能力', preferred_teacher_personality: '鼓励型', learning_style: '听觉型' },
  { name: '小辉', grade: '一年级', school: '实验小学', learning_needs: '英语学习缺乏系统性，需要规划学习路径', weak_subjects: '英语', learning_goals: '系统学习英语基础知识', preferred_teacher_personality: '专业耐心', learning_style: '视觉型' },
  { name: '小敏', grade: '二年级', school: '阳光小学', learning_needs: '数学空间想象力弱，几何学习困难', weak_subjects: '数学', learning_goals: '提高空间想象能力', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },

  // 四到六年级 (20人)
  { name: '张伟', grade: '四年级', school: '希望小学', learning_needs: '数学分数运算困难，需要系统学习分数知识', weak_subjects: '数学', learning_goals: '掌握分数运算', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '李娜', grade: '四年级', school: '光明小学', learning_needs: '语文作文写不好，缺乏写作素材和技巧', weak_subjects: '语文', learning_goals: '提高作文水平', preferred_teacher_personality: '温和亲切', learning_style: '视觉型' },
  { name: '王强', grade: '五年级', school: '育才小学', learning_needs: '英语语法混乱，需要系统梳理语法知识', weak_subjects: '英语', learning_goals: '掌握英语语法规则', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '刘芳', grade: '五年级', school: '实验小学', learning_needs: '数学应用题解题思路不清，需要培养解题思维', weak_subjects: '数学', learning_goals: '提高应用题解题能力', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '陈杰', grade: '六年级', school: '阳光小学', learning_needs: '语文文言文理解困难，需要加强古文学习', weak_subjects: '语文', learning_goals: '提高文言文阅读能力', preferred_teacher_personality: '儒雅博学', learning_style: '听觉型' },
  { name: '杨丽', grade: '六年级', school: '希望小学', learning_needs: '英语口语表达不流利，需要提高口语能力', weak_subjects: '英语', learning_goals: '提高英语口语水平', preferred_teacher_personality: '活泼生动', learning_style: '动觉型' },
  { name: '赵军', grade: '四年级', school: '光明小学', learning_needs: '数学几何图形理解困难，空间思维弱', weak_subjects: '数学', learning_goals: '提高几何学习能力', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '孙燕', grade: '五年级', school: '育才小学', learning_needs: '语文阅读理解深度不够，需要提高分析能力', weak_subjects: '语文', learning_goals: '提高深度阅读能力', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '周龙', grade: '六年级', school: '实验小学', learning_needs: '英语写作能力弱，不会组织英语句子', weak_subjects: '英语', learning_goals: '提高英语写作水平', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '吴梅', grade: '四年级', school: '阳光小学', learning_needs: '数学方程学习困难，需要打好基础', weak_subjects: '数学', learning_goals: '掌握方程基础知识', preferred_teacher_personality: '耐心细致', learning_style: '听觉型' },
  { name: '郑虎', grade: '五年级', school: '希望小学', learning_needs: '语文古诗词背诵和理解困难', weak_subjects: '语文', learning_goals: '提高古诗词学习能力', preferred_teacher_personality: '儒雅博学', learning_style: '听觉型' },
  { name: '冯兰', grade: '六年级', school: '光明小学', learning_needs: '英语听力理解能力差，需要加强训练', weak_subjects: '英语', learning_goals: '提高英语听力水平', preferred_teacher_personality: '耐心细致', learning_style: '听觉型' },
  { name: '褚波', grade: '四年级', school: '育才小学', learning_needs: '数学比例和百分数学习困难', weak_subjects: '数学', learning_goals: '掌握比例和百分数', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '卫静', grade: '五年级', school: '实验小学', learning_needs: '语文综合性学习能力弱，需要全面提升', weak_subjects: '语文', learning_goals: '提高综合语文素养', preferred_teacher_personality: '温和亲切', learning_style: '视觉型' },
  { name: '蒋峰', grade: '六年级', school: '阳光小学', learning_needs: '英语阅读速度慢，需要提高阅读效率', weak_subjects: '英语', learning_goals: '提高英语阅读速度', preferred_teacher_personality: '专业耐心', learning_style: '视觉型' },
  { name: '沈霞', grade: '四年级', school: '希望小学', learning_needs: '数学统计图表理解困难', weak_subjects: '数学', learning_goals: '掌握统计图表知识', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '韩亮', grade: '五年级', school: '光明小学', learning_needs: '语文议论文写作困难，逻辑思维弱', weak_subjects: '语文', learning_goals: '提高议论文写作能力', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '唐玲', grade: '六年级', school: '育才小学', learning_needs: '英语完形填空正确率低，需要提高综合能力', weak_subjects: '英语', learning_goals: '提高英语综合能力', preferred_teacher_personality: '专业耐心', learning_style: '视觉型' },
  { name: '许辉', grade: '四年级', school: '实验小学', learning_needs: '数学小数运算容易出错，需要加强练习', weak_subjects: '数学', learning_goals: '提高小数运算准确率', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '邓敏', grade: '五年级', school: '阳光小学', learning_needs: '语文现代文阅读答题不规范', weak_subjects: '语文', learning_goals: '规范阅读答题技巧', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },

  // 初一到初三 (20人)
  { name: '郭伟', grade: '初一', school: '希望中学', learning_needs: '数学代数学习困难，需要系统学习代数知识', weak_subjects: '数学', learning_goals: '掌握代数基础知识', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '马超', grade: '初一', school: '光明中学', learning_needs: '语文文言文基础薄弱，需要加强古文学习', weak_subjects: '语文', learning_goals: '打好文言文基础', preferred_teacher_personality: '儒雅博学', learning_style: '听觉型' },
  { name: '朱芳', grade: '初二', school: '育才中学', learning_needs: '英语时态混淆，需要系统梳理时态知识', weak_subjects: '英语', learning_goals: '掌握英语时态用法', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '胡杰', grade: '初二', school: '实验中学', learning_needs: '数学函数学习困难，抽象思维需要提高', weak_subjects: '数学', learning_goals: '理解函数概念', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '林丽', grade: '初三', school: '阳光中学', learning_needs: '语文作文立意不深，需要提高思想深度', weak_subjects: '语文', learning_goals: '提高作文立意水平', preferred_teacher_personality: '儒雅博学', learning_style: '视觉型' },
  { name: '何强', grade: '初三', school: '希望中学', learning_needs: '英语阅读理解难度大，词汇量不足', weak_subjects: '英语', learning_goals: '扩大词汇量，提高阅读能力', preferred_teacher_personality: '专业耐心', learning_style: '视觉型' },
  { name: '高强', grade: '初一', school: '光明中学', learning_needs: '数学几何证明题不会做，逻辑思维弱', weak_subjects: '数学', learning_goals: '提高几何证明能力', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '罗燕', grade: '初二', school: '育才中学', learning_needs: '语文古诗鉴赏能力弱，需要提高文学素养', weak_subjects: '语文', learning_goals: '提高古诗鉴赏能力', preferred_teacher_personality: '儒雅博学', learning_style: '听觉型' },
  { name: '梁龙', grade: '初三', school: '实验中学', learning_needs: '英语写作表达单一，需要丰富表达方式', weak_subjects: '英语', learning_goals: '提高英语写作水平', preferred_teacher_personality: '专业耐心', learning_style: '视觉型' },
  { name: '宋梅', grade: '初一', school: '阳光中学', learning_needs: '数学方程组解题困难，需要掌握解题方法', weak_subjects: '数学', learning_goals: '掌握方程组解法', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '唐虎', grade: '初二', school: '希望中学', learning_needs: '语文现代文阅读答题要点抓不住', weak_subjects: '语文', learning_goals: '提高阅读答题技巧', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '韩兰', grade: '初三', school: '光明中学', learning_needs: '英语听力反应慢，需要加强听力训练', weak_subjects: '英语', learning_goals: '提高英语听力水平', preferred_teacher_personality: '耐心细致', learning_style: '听觉型' },
  { name: '冯波', grade: '初一', school: '育才中学', learning_needs: '数学不等式学习困难，需要系统学习', weak_subjects: '数学', learning_goals: '掌握不等式知识', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '董静', grade: '初二', school: '实验中学', learning_needs: '语文综合性学习组织能力弱', weak_subjects: '语文', learning_goals: '提高综合学习能力', preferred_teacher_personality: '温和亲切', learning_style: '动觉型' },
  { name: '袁峰', grade: '初三', school: '阳光中学', learning_needs: '英语语法综合运用能力差', weak_subjects: '英语', learning_goals: '提高语法综合运用能力', preferred_teacher_personality: '专业耐心', learning_style: '视觉型' },
  { name: '夏霞', grade: '初一', school: '希望中学', learning_needs: '数学有理数运算容易出错', weak_subjects: '数学', learning_goals: '提高有理数运算准确率', preferred_teacher_personality: '耐心细致', learning_style: '视觉型' },
  { name: '侯亮', grade: '初二', school: '光明中学', learning_needs: '语文说明文阅读困难', weak_subjects: '语文', learning_goals: '提高说明文阅读能力', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '邹玲', grade: '初三', school: '育才中学', learning_needs: '英语任务型阅读得分低', weak_subjects: '英语', learning_goals: '提高任务型阅读能力', preferred_teacher_personality: '专业耐心', learning_style: '视觉型' },
  { name: '熊辉', grade: '初一', school: '实验中学', learning_needs: '数学整式运算规则不清楚', weak_subjects: '数学', learning_goals: '掌握整式运算规则', preferred_teacher_personality: '严谨认真', learning_style: '视觉型' },
  { name: '秦敏', grade: '初二', school: '阳光中学', learning_needs: '语文记叙文写作缺乏细节描写', weak_subjects: '语文', learning_goals: '提高细节描写能力', preferred_teacher_personality: '温和亲切', learning_style: '视觉型' }
];

// 主函数
async function seedDatabase() {
  try {
    console.log('🔌 正在连接MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB连接成功');

    // 清空现有数据（可选，如果只想追加数据可以注释掉）
    console.log('\n🗑️  正在清空现有AI匹配数据...');
    await AiTeacherProfile.deleteMany({});
    await AiStudentProfile.deleteMany({});
    console.log('✅ 数据清空完成');

    // 插入教师数据
    console.log('\n📚 正在插入教师数据...');
    const insertedTeachers = await AiTeacherProfile.insertMany(teachersData);
    console.log(`✅ 成功插入 ${insertedTeachers.length} 条教师数据`);

    // 插入学生数据
    console.log('\n👨‍🎓 正在插入学生数据...');
    const insertedStudents = await AiStudentProfile.insertMany(studentsData);
    console.log(`✅ 成功插入 ${insertedStudents.length} 条学生数据`);

    // 验证数据
    console.log('\n📊 数据验证:');
    const teacherCount = await AiTeacherProfile.countDocuments();
    const studentCount = await AiStudentProfile.countDocuments();
    console.log(`   - 教师总数: ${teacherCount}`);
    console.log(`   - 学生总数: ${studentCount}`);

    console.log('\n🎉 AI匹配测试数据种子完成！');
    console.log('\n💡 提示:');
    console.log('   - 现在可以测试学生端AI匹配功能');
    console.log('   - 现在可以测试教师端AI匹配功能');
    console.log('   - 数据已准备好，可以进行智能匹配测试\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 种子数据插入失败:', error);
    process.exit(1);
  }
}

// 执行
seedDatabase();
