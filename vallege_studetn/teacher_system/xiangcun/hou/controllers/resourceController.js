const Resource = require('../models/Resource');
const ResourceShare = require('../models/ResourceShare');
const Teacher = require('../models/Teacher');

// 上传教学资源
exports.uploadResource = async (req, res) => {
  try {
    const { title, description, resource_type } = req.body;

    if (!title || !resource_type) {
      return res.status(400).json({
        status: 'error',
        message: '请填写必填字段'
      });
    }

    // 查找或创建教师信息
    let teacher = await Teacher.findOne({ userId: req.user.id });
    
    if (!teacher) {
      // 如果没有Teacher记录，自动创建一个
      teacher = await Teacher.create({
        userId: req.user.id,
        name: req.user.name || '教师',
        subject: req.user.subject || '未设置',
        grade: req.user.grade || '未设置',
        status: 'approved'
      });
    }

    // 解析原始文件名（如果前端传递了编码后的文件名，则解码）
    let fileName = ''
    if (req.body.original_filename) {
      try {
        // 解码：btoa(unescape(encodeURIComponent(name))) 的逆操作
        fileName = decodeURIComponent(escape(atob(req.body.original_filename)))
      } catch (e) {
        fileName = req.body.original_filename
      }
    } else if (req.file) {
      fileName = req.file.originalname
    }
    
    const resource = await Resource.create({
      teacherId: teacher._id,
      title,
      description: description || '',
      resourceType: resource_type,
      // 将Windows路径转换为URL路径格式，确保以/开头
      filePath: req.file ? '/' + req.file.path.replace(/\\/g, '/') : '',
      fileSize: req.file ? req.file.size : 0,
      fileName: fileName
    });

    console.log('✅ 资源已保存到数据库:', {
      id: resource._id,
      teacherId: resource.teacherId,
      title: resource.title,
      filePath: resource.filePath,
      fileName: resource.fileName
    });

    res.status(201).json({
      status: 'success',
      message: '上传成功',
      data: {
        id: resource._id,
        title: resource.title,
        description: resource.description,
        resource_type: resource.resourceType,
        file_path: resource.filePath,
        file_name: resource.fileName,
        file_size: resource.fileSize,
        upload_date: resource.createdAt
      }
    });
  } catch (error) {
    console.error('上传资源错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取资源列表
exports.getResources = async (req, res) => {
  try {
    const { teacher_id, resource_type, page = 1, page_size = 20 } = req.query;

    let query = {};
    
    // 默认只获取当前登录教师的资源
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (teacher) {
      query.teacherId = teacher._id;
    } else {
      // 如果没有Teacher记录，返回空列表
      return res.json({
        status: 'success',
        message: '获取成功',
        data: {
          resources: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            page_size: parseInt(page_size),
            pages: 0
          }
        }
      });
    }
    
    if (teacher_id) {
      query.teacherId = teacher_id;
    }
    
    if (resource_type) {
      query.resourceType = resource_type;
    }

    const skip = (page - 1) * page_size;
    
    const resources = await Resource.find(query)
      .populate('teacherId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(page_size));

    const total = await Resource.countDocuments(query);

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        resources: resources.map(r => ({
          id: r._id,
          teacher_id: r.teacherId._id,
          teacher_name: r.teacherId.userId ? '教师' : '未知',
          title: r.title,
          description: r.description,
          resource_type: r.resourceType,
          file_path: r.filePath,
          file_name: r.fileName,
          file_size: r.fileSize,
          upload_date: r.createdAt
        })),
        pagination: {
          total,
          page: parseInt(page),
          page_size: parseInt(page_size),
          pages: Math.ceil(total / page_size)
        }
      }
    });
  } catch (error) {
    console.error('获取资源列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取资源详情
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('teacherId');

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: '资源不存在'
      });
    }

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        id: resource._id,
        teacher_id: resource.teacherId._id,
        teacher_name: resource.teacherId.userId ? '教师' : '未知',
        title: resource.title,
        description: resource.description,
        resource_type: resource.resourceType,
        file_path: resource.filePath,
        upload_date: resource.createdAt
      }
    });
  } catch (error) {
    console.error('获取资源详情错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 删除资源
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: '资源不存在'
      });
    }

    res.json({
      status: 'success',
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除资源错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 更新资源
exports.updateResource = async (req, res) => {
  try {
    console.log('🔄 更新资源请求:', {
      id: req.params.id,
      body: req.body,
      hasFile: !!req.file
    });
    
    const { title, description, resource_type, remove_file } = req.body;

    if (!title || !resource_type) {
      return res.status(400).json({
        status: 'error',
        message: '请填写必填字段'
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: '资源不存在'
      });
    }

    resource.title = title;
    resource.description = description || '';
    resource.resourceType = resource_type;
    
    // 如果要求删除文件
    if (remove_file === 'true' || remove_file === true) {
      console.log('🗑️ 删除文件');
      resource.filePath = '';
      resource.fileSize = 0;
      resource.fileName = '';
    }
    
    // 如果上传了新文件
    if (req.file) {
      console.log('📁 上传新文件:', req.file.originalname);
      // 解析原始文件名
      let fileName = ''
      if (req.body.original_filename) {
        try {
          fileName = decodeURIComponent(escape(atob(req.body.original_filename)))
        } catch (e) {
          console.error('解码文件名失败:', e);
          fileName = req.body.original_filename
        }
      } else {
        fileName = req.file.originalname
      }
      
      resource.filePath = '/' + req.file.path.replace(/\\/g, '/');
      resource.fileSize = req.file.size;
      resource.fileName = fileName;
    }
    
    await resource.save();
    
    console.log('✅ 资源更新成功:', resource._id);

    res.json({
      status: 'success',
      message: '更新成功',
      data: {
        id: resource._id,
        title: resource.title,
        description: resource.description,
        resource_type: resource.resourceType,
        file_path: resource.filePath,
        file_name: resource.fileName,
        file_size: resource.fileSize,
        updated_at: resource.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ 更新资源错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 分享资源给学生
exports.shareResource = async (req, res) => {
  try {
    const { student_id } = req.body;
    const resourceId = req.params.id;

    if (!student_id) {
      return res.status(400).json({
        status: 'error',
        message: '请提供学生ID'
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: '资源不存在'
      });
    }

    // 检查是否已分享
    const existingShare = await ResourceShare.findOne({
      resourceId,
      studentId: student_id
    });

    if (existingShare) {
      return res.status(409).json({
        status: 'error',
        message: '该资源已分享给此学生'
      });
    }

    // 创建分享记录
    const share = await ResourceShare.create({
      resourceId,
      studentId: student_id
    });

    res.status(201).json({
      status: 'success',
      message: '分享成功',
      data: {
        id: share._id,
        resource_id: share.resourceId,
        student_id: share.studentId,
        shared_at: share.createdAt
      }
    });
  } catch (error) {
    console.error('分享资源错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
