import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// 获取管理员仪表盘数据
router.get('/dashboard', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 获取今日统计
    const { data: keys } = await supabase
      .from('access_keys')
      .select('*');

    const { data: todayKeys } = await supabase
      .from('access_keys')
      .select('*')
      .gte('created_at', today);

    const { data: todayLogs } = await supabase
      .from('key_usage_logs')
      .select('*')
      .gte('created_at', today);

    const { data: onlineUsers } = await supabase
      .from('users')
      .select('*')
      .eq('is_online', true);

    const { data: activeSessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('status', 'active');

    // 获取即将过期的密钥（7天内）
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const { data: expiringKeys } = await supabase
      .from('access_keys')
      .select(`
        *,
        user:users(name, is_online)
      `)
      .eq('status', 'active')
      .lte('expires_at', sevenDaysLater.toISOString())
      .order('expires_at', { ascending: true });

    // 获取最近使用日志
    const { data: recentLogs } = await supabase
      .from('key_usage_logs')
      .select(`
        *,
        user:users(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // 计算统计数据
    const todayStats = {
      totalKeys: keys?.length || 0,
      activeKeys: keys?.filter(k => k.status === 'active').length || 0,
      expiredKeys: keys?.filter(k => k.status === 'expired').length || 0,
      newKeys: todayKeys?.length || 0,
      totalUsage: todayLogs?.length || 0,
      onlineAgents: onlineUsers?.length || 0,
      totalSessions: activeSessions?.length || 0
    };

    // 获取顶级坐席（模拟数据）
    const topAgents = onlineUsers?.slice(0, 5).map(user => ({
      agentId: user.id,
      agentName: user.name,
      sessionCount: Math.floor(Math.random() * 10) + 1,
      onlineTime: Math.floor(Math.random() * 8) + 1,
      satisfaction: Math.random() * 2 + 3
    })) || [];

    const dashboardData = {
      todayStats,
      recentLogs: recentLogs || [],
      expiringKeys: expiringKeys || [],
      topAgents
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取仪表盘数据失败'
    });
  }
});

// 获取系统统计信息
router.get('/stats', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // 获取密钥统计
    const { data: keyStats } = await supabase
      .from('access_keys')
      .select('status, created_at')
      .gte('created_at', startDate.toISOString());

    // 获取使用日志统计
    const { data: usageStats } = await supabase
      .from('key_usage_logs')
      .select('action, created_at')
      .gte('created_at', startDate.toISOString());

    // 获取会话统计
    const { data: sessionStats } = await supabase
      .from('chat_sessions')
      .select('status, started_at')
      .gte('started_at', startDate.toISOString());

    res.json({
      success: true,
      data: {
        keyStats: keyStats || [],
        usageStats: usageStats || [],
        sessionStats: sessionStats || []
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取统计信息失败'
    });
  }
});

// 获取系统配置
router.get('/config', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      throw error;
    }

    // 按分类组织配置
    const configByCategory = (settings || []).reduce((acc, setting) => {
      const category = setting.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      data: configByCategory
    });

  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取系统配置失败'
    });
  }
});

// 更新系统配置
router.put('/config', requireRole(['super_admin']), async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        error: 'INVALID_SETTINGS',
        message: '配置数据格式无效'
      });
    }

    // 批量更新配置
    const updatePromises = settings.map(setting => 
      supabase
        .from('system_settings')
        .upsert({
          key: setting.key,
          value: setting.value,
          description: setting.description,
          category: setting.category,
          is_public: setting.is_public || false
        })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: '系统配置更新成功'
    });

  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '更新系统配置失败'
    });
  }
});

// 获取操作日志
router.get('/logs', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { action, userId, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('key_usage_logs')
      .select(`
        *,
        user:users(name, email),
        key:access_keys(key_value)
      `)
      .order('created_at', { ascending: false });

    // 操作类型筛选
    if (action && action !== 'all') {
      query = query.eq('action', action);
    }

    // 用户筛选
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: logs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取操作日志失败'
    });
  }
});

// 清理过期数据
router.post('/cleanup', requireRole(['super_admin']), async (req, res) => {
  try {
    const { type, days = 30 } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let deletedCount = 0;

    switch (type) {
      case 'logs':
        const { count: logCount } = await supabase
          .from('key_usage_logs')
          .delete()
          .lt('created_at', cutoffDate.toISOString());
        deletedCount = logCount || 0;
        break;

      case 'expired_keys':
        const { count: keyCount } = await supabase
          .from('access_keys')
          .delete()
          .eq('status', 'expired')
          .lt('expires_at', cutoffDate.toISOString());
        deletedCount = keyCount || 0;
        break;

      case 'old_sessions':
        const { count: sessionCount } = await supabase
          .from('chat_sessions')
          .delete()
          .eq('status', 'ended')
          .lt('ended_at', cutoffDate.toISOString());
        deletedCount = sessionCount || 0;
        break;

      default:
        return res.status(400).json({
          error: 'INVALID_TYPE',
          message: '无效的清理类型'
        });
    }

    res.json({
      success: true,
      data: {
        deletedCount,
        type,
        cutoffDate: cutoffDate.toISOString()
      },
      message: `清理完成，删除了 ${deletedCount} 条记录`
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '数据清理失败'
    });
  }
});

export default router;