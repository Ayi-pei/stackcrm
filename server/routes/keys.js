import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole } from '../middleware/auth.js';

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

// 获取密钥列表（仅管理员）
router.get('/', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('access_keys')
      .select(`
        *,
        user:users(id, name, email, is_online),
        created_by_user:users!access_keys_created_by_fkey(name)
      `)
      .order('created_at', { ascending: false });

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 类型筛选
    if (type && type !== 'all') {
      query = query.eq('key_type', type);
    }

    // 分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: keys, error, count } = await query;

    if (error) {
      throw error;
    }

    // 计算密钥状态
    const processedKeys = keys.map(key => {
      const now = new Date();
      const expiresAt = new Date(key.expires_at);
      const daysUntilExpiry = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      
      let computedStatus = key.status;
      if (key.status === 'active' && expiresAt < now) {
        computedStatus = 'expired';
      } else if (key.status === 'active' && daysUntilExpiry <= 7) {
        computedStatus = 'expiring_soon';
      }

      return {
        ...key,
        computed_status: computedStatus,
        days_until_expiry: daysUntilExpiry,
        agent_name: key.user?.name,
        is_online: key.user?.is_online || false,
        created_by_name: key.created_by_user?.name
      };
    });

    res.json({
      success: true,
      data: processedKeys,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });

  } catch (error) {
    console.error('Get keys error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取密钥列表失败'
    });
  }
});

// 生成新密钥（仅管理员）
router.post('/generate', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { type = 'agent', validityDays = 2, maxUsage, agentId, notes } = req.body;

    // 验证输入
    if (!['agent', 'admin'].includes(type)) {
      return res.status(400).json({
        error: 'INVALID_TYPE',
        message: '密钥类型无效'
      });
    }

    if (validityDays < 1 || validityDays > 3650) {
      return res.status(400).json({
        error: 'INVALID_VALIDITY',
        message: '有效期必须在1-3650天之间'
      });
    }

    // 生成密钥
    let keyValue;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      keyValue = generateNaoiodKey(type);
      attempts++;
      
      // 检查密钥是否已存在
      const { data: existingKey } = await supabase
        .from('access_keys')
        .select('id')
        .eq('key_value', keyValue)
        .single();

      if (!existingKey) {
        break;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique key');
      }
    } while (true);

    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    // 保存密钥
    const { data: newKey, error } = await supabase
      .from('access_keys')
      .insert({
        key_value: keyValue,
        key_type: type,
        status: 'active',
        user_id: agentId || null,
        created_by: req.user.id,
        expires_at: expiresAt.toISOString(),
        max_usage: maxUsage || null,
        notes: notes || null
      })
      .select(`
        *,
        user:users(name, email),
        created_by_user:users!access_keys_created_by_fkey(name)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        ...newKey,
        agent_name: newKey.user?.name,
        created_by_name: newKey.created_by_user?.name
      },
      message: '密钥生成成功'
    });

  } catch (error) {
    console.error('Generate key error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '密钥生成失败'
    });
  }
});

// 更新密钥（仅管理员）
router.put('/:id', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, maxUsage, expiresAt } = req.body;

    const updates = {};
    
    if (notes !== undefined) {
      updates.notes = notes;
    }
    
    if (maxUsage !== undefined) {
      updates.max_usage = maxUsage;
    }
    
    if (expiresAt) {
      updates.expires_at = new Date(expiresAt).toISOString();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'NO_UPDATES',
        message: '没有提供更新数据'
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedKey, error } = await supabase
      .from('access_keys')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:users(name, email, is_online),
        created_by_user:users!access_keys_created_by_fkey(name)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedKey) {
      return res.status(404).json({
        error: 'KEY_NOT_FOUND',
        message: '密钥不存在'
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedKey,
        agent_name: updatedKey.user?.name,
        is_online: updatedKey.user?.is_online || false,
        created_by_name: updatedKey.created_by_user?.name
      },
      message: '密钥更新成功'
    });

  } catch (error) {
    console.error('Update key error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '密钥更新失败'
    });
  }
});

// 暂停密钥（仅管理员）
router.post('/:id/suspend', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedKey, error } = await supabase
      .from('access_keys')
      .update({ 
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!updatedKey) {
      return res.status(404).json({
        error: 'KEY_NOT_FOUND',
        message: '密钥不存在'
      });
    }

    res.json({
      success: true,
      data: updatedKey,
      message: '密钥已暂停'
    });

  } catch (error) {
    console.error('Suspend key error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '暂停密钥失败'
    });
  }
});

// 激活密钥（仅管理员）
router.post('/:id/activate', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedKey, error } = await supabase
      .from('access_keys')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!updatedKey) {
      return res.status(404).json({
        error: 'KEY_NOT_FOUND',
        message: '密钥不存在'
      });
    }

    res.json({
      success: true,
      data: updatedKey,
      message: '密钥已激活'
    });

  } catch (error) {
    console.error('Activate key error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '激活密钥失败'
    });
  }
});

// 删除密钥（仅超级管理员）
router.delete('/:id', requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // 检查密钥是否为管理员密钥
    const { data: keyData } = await supabase
      .from('access_keys')
      .select('key_value, key_type')
      .eq('id', id)
      .single();

    if (keyData && keyData.key_value === 'adminayi888') {
      return res.status(403).json({
        error: 'CANNOT_DELETE_ADMIN_KEY',
        message: '不能删除超级管理员密钥'
      });
    }

    const { error } = await supabase
      .from('access_keys')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: '密钥删除成功'
    });

  } catch (error) {
    console.error('Delete key error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '删除密钥失败'
    });
  }
});

// 获取密钥使用日志（仅管理员）
router.get('/:id/logs', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (page - 1) * limit;

    const { data: logs, error, count } = await supabase
      .from('key_usage_logs')
      .select(`
        *,
        user:users(name, email)
      `)
      .eq('key_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });

  } catch (error) {
    console.error('Get key logs error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取使用日志失败'
    });
  }
});

export default router;