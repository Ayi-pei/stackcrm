import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { authenticateKey } from '../middleware/auth.js';

const router = express.Router();

// 生成naoiod格式密钥
const generateNaoiodKey = (type = 'agent') => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = type === 'admin' ? 12 : 16; // 管理员密钥12位，坐席密钥16位
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// 验证naoiod格式密钥
const validateNaoiodFormat = (key) => {
  // naoiod格式：纯小写字母和数字组合，长度12-16位
  const pattern = /^[a-z0-9]{12,16}$/;
  return pattern.test(key);
};

// 登录接口
router.post('/login', authenticateKey, async (req, res) => {
  try {
    const user = req.user;
    const accessKey = req.accessKey;

    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role || 'admin',
        type: user.isAdmin ? 'admin' : 'agent',
        keyId: accessKey?.id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 记录登录日志
    if (accessKey) {
      await supabase
        .from('key_usage_logs')
        .insert({
          key_id: accessKey.id,
          user_id: user.id,
          action: 'login',
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        type: user.isAdmin ? 'admin' : 'agent',
        accessKey: accessKey?.key_value,
        keyExpiresAt: accessKey?.expires_at
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '登录失败，请稍后重试'
    });
  }
});

// 验证密钥接口
router.post('/validate-key', async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        error: 'MISSING_KEY',
        message: '请提供密钥'
      });
    }

    // 检查是否为管理员密钥
    if (key === process.env.ADMIN_KEY) {
      return res.json({
        isValid: true,
        type: 'admin',
        message: '管理员密钥有效'
      });
    }

    // 验证格式
    if (!validateNaoiodFormat(key)) {
      return res.json({
        isValid: false,
        message: '密钥格式不正确'
      });
    }

    // 查询密钥
    const { data: keyData, error } = await supabase
      .from('access_keys')
      .select('*')
      .eq('key_value', key)
      .single();

    if (error || !keyData) {
      return res.json({
        isValid: false,
        message: '密钥不存在'
      });
    }

    // 检查状态和有效期
    const isExpired = new Date(keyData.expires_at) < new Date();
    const isActive = keyData.status === 'active';
    const hasUsageLeft = !keyData.max_usage || keyData.usage_count < keyData.max_usage;

    const isValid = isActive && !isExpired && hasUsageLeft;

    res.json({
      isValid,
      type: keyData.key_type,
      expiresAt: keyData.expires_at,
      status: keyData.status,
      usageCount: keyData.usage_count,
      maxUsage: keyData.max_usage,
      message: isValid ? '密钥有效' : '密钥无效或已过期'
    });

  } catch (error) {
    console.error('Key validation error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '验证失败，请稍后重试'
    });
  }
});

// 登出接口
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 更新用户离线状态
        await supabase
          .from('users')
          .update({ is_online: false })
          .eq('id', decoded.userId);

        // 如果是坐席，记录登出日志
        if (decoded.keyId) {
          await supabase
            .from('key_usage_logs')
            .insert({
              key_id: decoded.keyId,
              user_id: decoded.userId,
              action: 'logout',
              ip_address: req.ip,
              user_agent: req.get('User-Agent')
            });
        }
      } catch (jwtError) {
        // JWT验证失败，忽略错误继续登出
        console.log('JWT verification failed during logout:', jwtError.message);
      }
    }

    res.json({
      success: true,
      message: '登出成功'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.json({
      success: true,
      message: '登出成功'
    });
  }
});

export default router;