// API 配置文件
const API_BASE_URL = 'http://localhost:5001'; // 更新为新端口

// 用户注册
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || '注册失败');
    }
    
    console.log('注册成功:', data);
    return data;
  } catch (error) {
    console.error('注册时出错:', error);
    throw error;
  }
}

// 用户登录
async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || '登录失败');
    }
    
    // 保存token到localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    console.log('登录成功:', data);
    return data;
  } catch (error) {
    console.error('登录时出错:', error);
    throw error;
  }
}

// 获取当前用户信息
async function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || '获取用户信息失败');
    }
    
    console.log('获取用户信息成功:', data);
    
    // 确保返回的对象有id属性（MongoDB使用_id）
    return {
      ...data,
      id: data._id || data.id  // 兼容_id和id
    };
  } catch (error) {
    console.error('获取用户信息时出错:', error);
    throw error;
  }
}

// 获取教学资源
async function getResources() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resources`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') // 如果有认证token的话
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('获取到的教学资源:', data);
    return data;
  } catch (error) {
    console.error('获取教学资源时出错:', error);
    return null;
  }
}

// 获取AI推荐
async function getAIRecommendations(studentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/student/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') // 如果有认证token的话
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('获取到的AI推荐:', data);
    return data;
  } catch (error) {
    console.error('获取AI推荐时出错:', error);
    return null;
  }
}

// 生成AI推荐
async function generateAIRecommendation(studentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate/${studentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') // 如果有认证token的话
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('生成的AI推荐:', data);
    return data;
  } catch (error) {
    console.error('生成AI推荐时出错:', error);
    return null;
  }
}

// 发送消息
async function sendMessage(receiverId, content, matchId = null) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        receiverId,
        content,
        matchId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '发送消息失败');
    }

    const data = await response.json();
    console.log('消息发送成功:', data);
    return data;
  } catch (error) {
    console.error('发送消息时出错:', error);
    throw error;
  }
}

// 获取与特定用户的聊天记录
async function getMessages(userId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/messages/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '获取消息失败');
    }

    const data = await response.json();
    console.log('获取消息成功:', data);
    return data;
  } catch (error) {
    console.error('获取消息时出错:', error);
    throw error;
  }
}

// 获取对话列表
async function getConversations() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/messages/conversations/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '获取对话列表失败');
    }

    const data = await response.json();
    console.log('获取对话列表成功:', data);
    return data;
  } catch (error) {
    console.error('获取对话列表时出错:', error);
    throw error;
  }
}

// 获取所有教师列表
async function getTeachers() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/teachers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '获取教师列表失败');
    }

    const data = await response.json();
    console.log('获取教师列表成功:', data);
    return data;
  } catch (error) {
    console.error('获取教师列表时出错:', error);
    throw error;
  }
}

// 发送辅导请求
async function sendMatchRequest(teacherId, message = '') {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/matches/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ teacherId, message })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '发送请求失败');
    }

    const data = await response.json();
    console.log('发送辅导请求成功:', data);
    return data;
  } catch (error) {
    console.error('发送辅导请求时出错:', error);
    throw error;
  }
}

// 获取匹配列表
async function getMatches() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/matches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '获取匹配列表失败');
    }

    const data = await response.json();
    console.log('获取匹配列表成功:', data);
    return data;
  } catch (error) {
    console.error('获取匹配列表时出错:', error);
    throw error;
  }
}

// 取消辅导请求
async function cancelMatchRequest(matchId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '取消请求失败');
    }

    const data = await response.json();
    console.log('取消请求成功:', data);
    return data;
  } catch (error) {
    console.error('取消请求时出错:', error);
    throw error;
  }
}

// 提交心理健康评估
async function submitPsychologicalAssessment(assessmentData) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/psychological/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(assessmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '提交评估失败');
    }

    const data = await response.json();
    console.log('提交评估成功:', data);
    return data;
  } catch (error) {
    console.error('提交评估时出错:', error);
    throw error;
  }
}

// 获取心理评估历史
async function getPsychologicalHistory() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/psychological/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '获取评估历史失败');
    }

    const data = await response.json();
    console.log('获取评估历史成功:', data);
    return data;
  } catch (error) {
    console.error('获取评估历史时出错:', error);
    throw error;
  }
}

// 获取最新评估结果
async function getLatestAssessment() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/psychological/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '获取评估结果失败');
    }

    const data = await response.json();
    console.log('获取最新评估成功:', data);
    return data;
  } catch (error) {
    console.error('获取最新评估时出错:', error);
    throw error;
  }
}

// 获取学习资源列表（支持搜索和筛选）
async function getResources(params = {}) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.subject) queryParams.append('subject', params.subject);
    if (params.resourceType) queryParams.append('resourceType', params.resourceType);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/resources${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '获取资源列表失败');
    }

    const data = await response.json();
    console.log('获取资源列表成功:', data.length, '个资源');
    return data;
  } catch (error) {
    console.error('获取资源列表时出错:', error);
    throw error;
  }
}

// 下载资源
async function downloadResource(resourceId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '下载资源失败');
    }

    const data = await response.json();
    console.log('下载资源成功:', data);
    return data;
  } catch (error) {
    console.error('下载资源时出错:', error);
    throw error;
  }
}

console.log("API连接配置完成，后端URL:", API_BASE_URL);