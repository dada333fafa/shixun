<template>
  <div class="container">
    <Sidebar />
    <div class="main-content">
      <div class="header">
        <h1>系统设置</h1>
        <div class="user-info">
          <span>欢迎，{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="settings-tabs">
        <div class="tabs">
          <div v-for="tab in tabs" :key="tab.id" :class="['tab', { active: activeTab === tab.id }]" @click="activeTab = tab.id">{{ tab.name }}</div>
        </div>
      </div>
      
      <div class="system-info">
        <h3>系统信息</h3>
        <p><span class="label">系统版本：</span> v1.0.0</p>
        <p><span class="label">最后更新：</span> 2026-03-31 10:00:00</p>
        <p><span class="label">服务器状态：</span> 运行中</p>
        <p><span class="label">数据库状态：</span> 正常</p>
      </div>
      
      <!-- 基本设置 -->
      <div class="settings-section" v-if="activeTab === 'basic'">
        <h3>基本设置</h3>
        <div class="settings-grid">
          <div class="settings-group">
            <label>网站名称</label>
            <input type="text" v-model="settings.siteName">
          </div>
          <div class="settings-group">
            <label>网站描述</label>
            <input type="text" v-model="settings.siteDescription">
          </div>
          <div class="settings-group">
            <label>网站URL</label>
            <input type="text" v-model="settings.siteUrl">
          </div>
          <div class="settings-group">
            <label>时区</label>
            <select v-model="settings.timezone">
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
            </select>
          </div>
          <div class="settings-group">
            <label>默认语言</label>
            <select v-model="settings.language">
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
          <div class="settings-group">
            <label>管理员邮箱</label>
            <input type="email" v-model="settings.adminEmail">
          </div>
        </div>
      </div>
      
      <!-- 邮件配置 -->
      <div class="settings-section" v-if="activeTab === 'email'">
        <h3>邮件配置</h3>
        <div class="settings-grid">
          <div class="settings-group">
            <label>SMTP服务器</label>
            <input type="text" v-model="settings.smtpHost" placeholder="smtp.example.com">
          </div>
          <div class="settings-group">
            <label>SMTP端口</label>
            <input type="number" v-model="settings.smtpPort" placeholder="587">
          </div>
          <div class="settings-group">
            <label>发件人邮箱</label>
            <input type="email" v-model="settings.smtpUser" placeholder="noreply@example.com">
          </div>
          <div class="settings-group">
            <label>邮箱密码</label>
            <input type="password" v-model="settings.smtpPass" placeholder="输入密码">
          </div>
          <div class="settings-group">
            <label>加密方式</label>
            <select v-model="settings.smtpSecure">
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">无</option>
            </select>
          </div>
          <div class="settings-group">
            <label>测试邮件</label>
            <div class="checkbox-group">
              <input type="checkbox" v-model="settings.enableEmailNotification">
              <span>启用邮件通知</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 短信配置 -->
      <div class="settings-section" v-if="activeTab === 'sms'">
        <h3>短信配置</h3>
        <div class="settings-grid">
          <div class="settings-group">
            <label>短信服务商</label>
            <select v-model="settings.smsProvider">
              <option value="aliyun">阿里云</option>
              <option value="tencent">腾讯云</option>
              <option value="huawei">华为云</option>
            </select>
          </div>
          <div class="settings-group">
            <label>Access Key ID</label>
            <input type="text" v-model="settings.smsAccessKey" placeholder="输入Access Key">
          </div>
          <div class="settings-group">
            <label>Access Key Secret</label>
            <input type="password" v-model="settings.smsSecret" placeholder="输入Secret">
          </div>
          <div class="settings-group">
            <label>签名名称</label>
            <input type="text" v-model="settings.smsSignName" placeholder="输入短信签名">
          </div>
          <div class="settings-group">
            <label>模板ID</label>
            <input type="text" v-model="settings.smsTemplateId" placeholder="输入模板ID">
          </div>
          <div class="settings-group">
            <label>启用短信通知</label>
            <div class="checkbox-group">
              <input type="checkbox" v-model="settings.enableSmsNotification">
              <span>启用</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 安全设置 -->
      <div class="settings-section" v-if="activeTab === 'security'">
        <h3>安全设置</h3>
        <div class="settings-grid">
          <div class="settings-group">
            <label>会话超时 (分钟)</label>
            <input type="number" v-model="settings.sessionTimeout" min="5" max="120">
          </div>
          <div class="settings-group">
            <label>最小密码长度</label>
            <input type="number" v-model="settings.passwordLength" min="6" max="20">
          </div>
          <div class="settings-group">
            <label>登录尝试次数限制</label>
            <input type="number" v-model="settings.loginAttempts" min="1" max="10">
          </div>
          <div class="settings-group">
            <label>启用双因素认证</label>
            <div class="checkbox-group">
              <input type="checkbox" v-model="settings.twoFactorEnabled">
              <span>启用</span>
            </div>
          </div>
          <div class="settings-group">
            <label>密码复杂度要求</label>
            <select v-model="settings.passwordComplexity">
              <option value="low">低 (仅长度要求)</option>
              <option value="medium">中 (包含字母和数字)</option>
              <option value="high">高 (包含大小写字母、数字和特殊字符)</option>
            </select>
          </div>
          <div class="settings-group">
            <label>IP白名单</label>
            <textarea v-model="settings.ipWhitelist" rows="3" placeholder="每行一个IP地址"></textarea>
          </div>
        </div>
      </div>
      
      <!-- 存储设置 -->
      <div class="settings-section" v-if="activeTab === 'storage'">
        <h3>存储设置</h3>
        <div class="settings-grid">
          <div class="settings-group">
            <label>存储类型</label>
            <select v-model="settings.storageType">
              <option value="local">本地存储</option>
              <option value="oss">阿里云OSS</option>
              <option value="cos">腾讯云COS</option>
            </select>
          </div>
          <div class="settings-group">
            <label>上传路径</label>
            <input type="text" v-model="settings.uploadPath" placeholder="/uploads">
          </div>
          <div class="settings-group">
            <label>最大文件大小 (MB)</label>
            <input type="number" v-model="settings.maxFileSize" min="1" max="100">
          </div>
          <div class="settings-group">
            <label>允许的文件类型</label>
            <input type="text" v-model="settings.allowedFileTypes" placeholder="jpg,png,pdf,doc">
          </div>
          <div class="settings-group">
            <label>Bucket名称 (OSS/COS)</label>
            <input type="text" v-model="settings.bucketName" placeholder="输入Bucket名称">
          </div>
          <div class="settings-group">
            <label>Region (OSS/COS)</label>
            <input type="text" v-model="settings.storageRegion" placeholder="oss-cn-hangzhou">
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="btn btn-primary" @click="saveSettings">保存设置</button>
        <button class="btn btn-secondary" @click="testSettings">测试配置</button>
        <button class="btn btn-secondary" @click="resetSettings">恢复默认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import axios from 'axios'

const userName = ref('管理员')
const userInitial = ref('管')
const activeTab = ref('basic')
const tabs = [
  { id: 'basic', name: '基本设置' },
  { id: 'email', name: '邮件配置' },
  { id: 'sms', name: '短信配置' },
  { id: 'security', name: '安全设置' },
  { id: 'storage', name: '存储设置' }
]
const settings = ref({
  // 基本设置
  siteName: '乡村助学平台',
  siteDescription: '为乡村孩子提供优质教育资源和心理支持',
  siteUrl: 'http://localhost:3000',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  adminEmail: 'admin@example.com',
  // 邮件配置
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpSecure: 'tls',
  enableEmailNotification: false,
  // 短信配置
  smsProvider: 'aliyun',
  smsAccessKey: '',
  smsSecret: '',
  smsSignName: '',
  smsTemplateId: '',
  enableSmsNotification: false,
  // 安全设置
  sessionTimeout: 30,
  passwordLength: 8,
  loginAttempts: 5,
  twoFactorEnabled: false,
  passwordComplexity: 'medium',
  ipWhitelist: '',
  // 存储配置
  storageType: 'local',
  uploadPath: '/uploads',
  maxFileSize: 10,
  allowedFileTypes: 'jpg,png,pdf,doc,docx',
  bucketName: '',
  storageRegion: ''
})

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.name) {
    userName.value = user.name
    userInitial.value = user.name.charAt(0)
  }
  loadSettings()
})

const loadSettings = async () => {
  try {
    console.log('开始加载设置...')
    const response = await axios.get('/api/settings')
    console.log('后端返回的数据:', response.data)
    
    if (response.data.success && response.data.settings) {
      const backendSettings = response.data.settings
      // 将所有后端数据合并到前端设置中
      settings.value = {
        ...settings.value,
        ...backendSettings
      }
      console.log('加载后的settings:', settings.value)
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    console.error('错误详情:', error.response)
  }
}

const saveSettings = async () => {
  try {
    console.log('开始保存设置:', settings.value)
    const response = await axios.put('/api/settings', settings.value)
    console.log('保存响应:', response.data)
    
    if (response.data.success) {
      alert('设置保存成功')
      // 重新加载以确认数据已保存
      await loadSettings()
    } else {
      alert('保存失败: ' + response.data.message)
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    console.error('错误详情:', error.response)
    alert('保存失败: ' + (error.response?.data?.message || error.message))
  }
}

const testSettings = () => alert('测试配置功能待实现')
const resetSettings = () => {
  settings.value = {
    siteName: '乡村助学平台',
    siteDescription: '为乡村孩子提供优质教育资源和心理支持',
    siteUrl: 'http://localhost:3000',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    adminEmail: 'admin@example.com',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: 'tls',
    enableEmailNotification: false,
    smsProvider: 'aliyun',
    smsAccessKey: '',
    smsSecret: '',
    smsSignName: '',
    smsTemplateId: '',
    enableSmsNotification: false,
    sessionTimeout: 30,
    passwordLength: 8,
    loginAttempts: 5,
    twoFactorEnabled: false,
    passwordComplexity: 'medium',
    ipWhitelist: '',
    storageType: 'local',
    uploadPath: '/uploads',
    maxFileSize: 10,
    allowedFileTypes: 'jpg,png,pdf,doc,docx',
    bucketName: '',
    storageRegion: ''
  }
}
</script>

<style scoped>
.container { display: flex; min-height: 100vh; }
.main-content { flex: 1; padding: 20px; }
.header { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.header h1 { color: #9C27B0; font-size: 1.8em; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: #9C27B0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
.settings-tabs { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
.tabs { display: flex; gap: 20px; margin-bottom: 20px; }
.tab { padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-weight: bold; }
.tab.active { background-color: #9C27B0; color: white; }
.tab:hover { background-color: #f0f0f0; }
.system-info { background: #f9f9f9; padding: 20px; border-radius: 10px; border-left: 4px solid #9C27B0; margin-bottom: 20px; }
.system-info p { margin-bottom: 10px; font-size: 0.9em; }
.system-info .label { font-weight: bold; color: #555; }
.settings-section { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
.settings-section h3 { color: #9C27B0; margin-bottom: 20px; font-size: 1.3em; }
.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.settings-group { margin-bottom: 20px; }
.settings-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #555; }
.settings-group input, .settings-group select, .settings-group textarea { width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px; font-size: 1em; }
.settings-group textarea { resize: vertical; font-family: inherit; }
.settings-group .checkbox-group { display: flex; align-items: center; gap: 10px; }
.settings-group .checkbox-group input[type="checkbox"] { width: auto; }
.btn { padding: 10px 20px; border: none; border-radius: 5px; font-size: 1em; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background: #9C27B0; color: white; }
.btn-primary:hover { background: #7B1FA2; transform: translateY(-2px); }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-secondary:hover { background: #bdbdbd; transform: translateY(-2px); }
.action-buttons { display: flex; gap: 10px; margin-top: 20px; }
@media (max-width: 768px) { .container { flex-direction: column; } .sidebar { width: 100%; padding: 10px; } .nav-menu { display: flex; overflow-x: auto; gap: 10px; } .nav-menu li { margin-bottom: 0; } .tabs { overflow-x: auto; flex-wrap: nowrap; } .settings-grid { grid-template-columns: 1fr; } }
</style>
