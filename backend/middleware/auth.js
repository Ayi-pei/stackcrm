import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// JWT认证中间件
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '访问令牌缺失' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 验证用户是否存在
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: '无效的访问令牌' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    return res.status(403).json({ error: '令牌验证失败' });
  }
};

// 卡密认证中间件
export const authenticateKey = async (req, res, next) => {
  try {
    const { key, accessKey } = req.body;
    const keyValue = key || accessKey;

    if (!keyValue) {
      return res.status(400).json({ error: '访问密钥缺失' });
    }

    // 检查是否为管理员特殊卡密
    if (keyValue === process.env.ADMIN_KEY) {
      req.user = {
        id: 'admin',
        role: 'admin',
        name: '系统管理员',
        isAdmin: true
      };
      return next();
    }

    // 验证普通访问密钥
    const { data: keyData, error } = await supabase
      .from('access_keys')
      .select(`
        *,
        user:users(*)
      `)
      .eq('key_value', keyValue)
      .eq('status', 'active')
      .single();

    if (error || !keyData) {
      return res.status(401).json({ error: '无效的访问密钥' });
    }

    // 检查密钥是否过期
    if (new Date(keyData.expires_at) < new Date()) {
      await supabase
        .from('access_keys')
        .update({ status: 'expired' })
        .eq('id', keyData.id);
      
      return res.status(401).json({ error: '访问密钥已过期' });
    }

    // 更新使用次数和最后使用时间
    await supabase
      .from('access_keys')
      .update({
        usage_count: keyData.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', keyData.id);

    req.user = keyData.user;
    req.accessKey = keyData;
    next();
  } catch (error) {
    console.error('密钥认证错误:', error);
    return res.status(500).json({ error: '认证服务错误' });
  }
};

// 管理员权限验证
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// 角色权限验证
export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '用户未认证' });
      }

      // 管理员拥有所有权限
      if (req.user.isAdmin) {
        return next();
      }

      // 获取用户角色信息
      const { data: userRole, error } = await supabase
        .from('users')
        .select(`
          role:roles(*)
        `)
        .eq('id', req.user.id)
        .single();

      if (error || !userRole.role) {
        return res.status(403).json({ error: '用户角色信息不存在' });
      }

      if (!roles.includes(userRole.role.name)) {
        return res.status(403).json({ error: '权限不足' });
      }

      next();
    } catch (error) {
      console.error('角色验证错误:', error);
      return res.status(500).json({ error: '权限验证失败' });
    }
  };
};

// 权限验证中间件
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '用户未认证' });
      }

      // 管理员拥有所有权限
      if (req.user.isAdmin) {
        return next();
      }

      // 获取用户角色和权限信息
      const { data: userWithRole, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(
            *,
            role_permissions(
              permission:permissions(*)
            )
          )
        `)
        .eq('id', req.user.id)
        .single();

      if (error || !userWithRole.role) {
        return res.status(403).json({ error: '用户角色信息不存在' });
      }

      // 检查是否有指定权限
      const hasPermission = userWithRole.role.role_permissions.some(rp => 
        rp.permission.name === permission
      );

      if (!hasPermission) {
        return res.status(403).json({ error: '权限不足' });
      }

      next();
    } catch (error) {
      console.error('权限验证错误:', error);
      return res.status(500).json({ error: '权限验证失败' });
    }
  };
};