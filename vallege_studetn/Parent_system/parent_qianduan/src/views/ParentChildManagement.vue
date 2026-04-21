<template>
  <div>
    <div class="add-child" v-if="!editingChild">
      <h2>添加孩子</h2>
      <form @submit.prevent="addChild">
        <div class="form-group">
          <label for="child-name">孩子姓名</label>
          <input type="text" id="child-name" v-model="newChild.name" placeholder="请输入孩子姓名" required>
        </div>
        <div class="form-group">
          <label for="child-grade">年级</label>
          <select id="child-grade" v-model="newChild.grade" required>
            <option value="一年级">一年级</option>
            <option value="二年级">二年级</option>
            <option value="三年级">三年级</option>
            <option value="四年级">四年级</option>
            <option value="五年级">五年级</option>
            <option value="六年级">六年级</option>
          </select>
        </div>
        <div class="form-group">
          <label for="child-subject">需要辅导的科目</label>
          <select id="child-subject" v-model="newChild.subject" required>
            <option value="数学">数学</option>
            <option value="语文">语文</option>
            <option value="英语">英语</option>
            <option value="物理">物理</option>
            <option value="化学">化学</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">添加孩子</button>
      </form>
    </div>
    
    <div class="edit-child" v-else>
      <h2>编辑孩子信息</h2>
      <form @submit.prevent="saveEdit">
        <div class="form-group">
          <label for="edit-name">孩子姓名</label>
          <input type="text" id="edit-name" v-model="editForm.name" placeholder="请输入孩子姓名" required>
        </div>
        <div class="form-group">
          <label for="edit-grade">年级</label>
          <select id="edit-grade" v-model="editForm.grade" required>
            <option value="一年级">一年级</option>
            <option value="二年级">二年级</option>
            <option value="三年级">三年级</option>
            <option value="四年级">四年级</option>
            <option value="五年级">五年级</option>
            <option value="六年级">六年级</option>
          </select>
        </div>
        <div class="form-group">
          <label for="edit-school">学校</label>
          <input type="text" id="edit-school" v-model="editForm.school" placeholder="请输入学校名称">
        </div>
        <div class="form-group">
          <label for="edit-address">地址</label>
          <input type="text" id="edit-address" v-model="editForm.address" placeholder="请输入家庭地址">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">保存</button>
          <button type="button" class="btn btn-secondary" @click="cancelEdit">取消</button>
        </div>
      </form>
    </div>
    
    <div class="child-list">
      <table>
        <thead>
          <tr>
            <th>孩子姓名</th>
            <th>年级</th>
            <th>学校</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="child in children" :key="child._id">
            <td>{{ child.user_id?.name || '未知' }}</td>
            <td>{{ child.grade || '未知' }}</td>
            <td>{{ child.school || '未填写' }}</td>
            <td><span class="status-badge status-active">活跃</span></td>
            <td>
              <button class="btn btn-primary" @click="editChild(child)">编辑</button>
              <button class="btn btn-primary" @click="deleteChild(child._id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { get, post } from '../api/config.js'

export default {
  name: 'ParentChildManagement',
  data() {
    return {
      children: [],
      newChild: {
        name: '',
        grade: '一年级',
        subject: '数学'
      },
      editingChild: null,
      editForm: {
        name: '',
        grade: '一年级',
        school: '',
        address: ''
      }
    }
  },
  computed: {
    parentId() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user._id
      }
      return null
    }
  },
  mounted() {
    this.fetchChildren()
  },
  methods: {
    async fetchChildren() {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      try {
        const response = await get(`/parents/children/${this.parentId}`)
        if (response.success) {
          this.children = response.children
        }
      } catch (error) {
        console.error('获取孩子列表失败:', error)
      }
    },
    async addChild() {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      try {
        const response = await post('/children/add', {
          parentId: this.parentId,
          ...this.newChild
        })
        if (response.success) {
          alert('添加孩子成功！')
          this.fetchChildren()
          this.newChild = { name: '', grade: '一年级', subject: '数学' }
        } else {
          alert('添加孩子失败：' + response.message)
        }
      } catch (error) {
        console.error('添加孩子失败:', error)
        alert('添加孩子失败')
      }
    },
    editChild(child) {
      this.editingChild = child
      this.editForm = {
        name: child.user_id?.name || '',
        grade: child.grade || '一年级',
        school: child.school || '',
        address: child.address || ''
      }
    },
    async saveEdit() {
      if (!this.parentId || !this.editingChild) {
        console.error('家长ID或孩子信息不存在')
        alert('家长ID或孩子信息不存在')
        return
      }
      
      try {
        console.log('编辑孩子信息:', this.editForm)
        console.log('用户ID:', this.editingChild.user_id._id)
        console.log('学生ID:', this.editingChild._id)
        
        // 先更新用户信息
        const userResponse = await post('/users/update', {
          userId: this.editingChild.user_id._id.toString(),
          name: this.editForm.name
        })
        
        console.log('更新用户响应:', userResponse)
        
        if (userResponse.success) {
          // 再更新学生信息
          const studentResponse = await post('/students/update', {
            studentId: this.editingChild._id.toString(),
            grade: this.editForm.grade,
            school: this.editForm.school,
            address: this.editForm.address
          })
          
          console.log('更新学生响应:', studentResponse)
          
          if (studentResponse.success) {
            alert('编辑成功！')
            this.fetchChildren()
            this.cancelEdit()
          } else {
            alert('编辑失败：' + studentResponse.message)
          }
        } else {
          alert('编辑失败：' + userResponse.message)
        }
      } catch (error) {
        console.error('编辑孩子失败:', error)
        alert('编辑失败: ' + error.message)
      }
    },
    cancelEdit() {
      this.editingChild = null
      this.editForm = {
        name: '',
        grade: '一年级',
        school: '',
        address: ''
      }
    },
    async deleteChild(childId) {
      if (confirm('确定要删除这个孩子吗？')) {
        try {
          const response = await post('/children/delete', { childId })
          if (response.success) {
            alert('删除成功！')
            this.fetchChildren()
          } else {
            alert('删除失败：' + response.message)
          }
        } catch (error) {
          console.error('删除孩子失败:', error)
          alert('删除失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.add-child {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.add-child h2 {
  color: #FF9800;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #FF9800;
  color: white;
}

.btn-primary:hover {
  background: #F57C00;
  transform: translateY(-2px);
}

.child-list {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background: #f5f5f5;
  font-weight: bold;
  color: #333;
}

tr:hover {
  background: #f9f9f9;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 10px;
  }
}
</style>
