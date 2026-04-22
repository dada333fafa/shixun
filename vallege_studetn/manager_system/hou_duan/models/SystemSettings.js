const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // 基本设置
  siteName: {
    type: String,
    default: '乡村助学平台'
  },
  siteDescription: {
    type: String,
    default: '为乡村孩子提供优质教育资源和心理支持'
  },
  siteUrl: {
    type: String,
    default: 'http://localhost:3000'
  },
  timezone: {
    type: String,
    default: 'Asia/Shanghai'
  },
  language: {
    type: String,
    default: 'zh-CN'
  },
  adminEmail: {
    type: String,
    default: 'admin@example.com'
  },
  // 邮件配置
  smtpHost: String,
  smtpPort: Number,
  smtpUser: String,
  smtpPass: String,
  smtpSecure: String,
  smtpUsername: String,
  smtpPassword: String,
  smtpSecureBool: {
    type: Boolean,
    default: true
  },
  emailFrom: String,
  enableEmailNotification: {
    type: Boolean,
    default: false
  },
  // 短信配置
  smsProvider: String,
  smsAccessKey: String,
  smsSecret: String,
  smsSignName: String,
  smsTemplateId: String,
  enableSmsNotification: {
    type: Boolean,
    default: false
  },
  // 安全设置
  sessionTimeout: {
    type: Number,
    default: 30
  },
  passwordLength: {
    type: Number,
    default: 8
  },
  loginAttempts: {
    type: Number,
    default: 5
  },
  lockoutDuration: {
    type: Number,
    default: 30
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  passwordComplexity: {
    type: String,
    default: 'medium'
  },
  ipWhitelist: String,
  httpsEnabled: {
    type: Boolean,
    default: false
  },
  // 存储设置
  storageType: {
    type: String,
    default: 'local'
  },
  uploadPath: String,
  maxFileSize: {
    type: Number,
    default: 10
  },
  allowedFileTypes: String,
  bucketName: String,
  storageRegion: String
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
