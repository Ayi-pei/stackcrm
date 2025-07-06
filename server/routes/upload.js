import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/zip',
    'application/x-zip-compressed',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// 文件上传接口
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'NO_FILE',
        message: '没有上传文件'
      });
    }

    const { sessionId } = req.body;
    const file = req.file;

    // 生成文件URL
    const fileUrl = `/uploads/${file.filename}`;

    // 保存文件信息到数据库
    const { data: fileRecord, error } = await supabase
      .from('file_uploads')
      .insert({
        original_name: file.originalname,
        file_name: file.filename,
        file_path: fileUrl,
        file_size: file.size,
        file_type: file.mimetype,
        uploaded_by: req.user.id,
        session_id: sessionId,
        status: 'uploaded'
      })
      .select()
      .single();

    if (error) {
      // 如果数据库保存失败，删除已上传的文件
      fs.unlinkSync(file.path);
      throw error;
    }

    res.json({
      success: true,
      data: {
        id: fileRecord.id,
        originalName: file.originalname,
        fileName: file.filename,
        fileUrl: fileUrl,
        fileSize: file.size,
        fileType: file.mimetype
      },
      message: '文件上传成功'
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    // 清理上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        message: '文件大小超出限制'
      });
    }

    res.status(500).json({
      error: 'UPLOAD_FAILED',
      message: error.message || '文件上传失败'
    });
  }
});

// 头像上传接口
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'NO_FILE',
        message: '没有上传头像文件'
      });
    }

    const file = req.file;

    // 验证是否为图片文件
    if (!file.mimetype.startsWith('image/')) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: 'INVALID_FILE_TYPE',
        message: '只能上传图片文件'
      });
    }

    // 生成头像URL
    const avatarUrl = `/uploads/${file.filename}`;

    // 更新用户头像
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      fs.unlinkSync(file.path);
      throw error;
    }

    res.json({
      success: true,
      data: {
        avatarUrl: avatarUrl,
        user: updatedUser
      },
      message: '头像上传成功'
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'UPLOAD_FAILED',
      message: '头像上传失败'
    });
  }
});

// 获取文件信息
router.get('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: fileRecord, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!fileRecord) {
      return res.status(404).json({
        error: 'FILE_NOT_FOUND',
        message: '文件不存在'
      });
    }

    res.json({
      success: true,
      data: fileRecord
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取文件信息失败'
    });
  }
});

// 删除文件
router.delete('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 获取文件信息
    const { data: fileRecord, error: getError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', id)
      .single();

    if (getError) {
      throw getError;
    }

    if (!fileRecord) {
      return res.status(404).json({
        error: 'FILE_NOT_FOUND',
        message: '文件不存在'
      });
    }

    // 检查权限（只能删除自己上传的文件）
    if (fileRecord.uploaded_by !== req.user.id && req.user.role.name !== 'super_admin') {
      return res.status(403).json({
        error: 'INSUFFICIENT_PERMISSIONS',
        message: '没有权限删除此文件'
      });
    }

    // 删除数据库记录
    const { error: deleteError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // 删除物理文件
    const filePath = join(__dirname, '../uploads', fileRecord.file_name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: '文件删除成功'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '删除文件失败'
    });
  }
});

export default router;