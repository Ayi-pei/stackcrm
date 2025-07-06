import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// 获取所有坐席列表
router.get('/', requirePermission('agent.view'), async (req, res) => {
  try {
    const { status, role, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('users')
      .select(`
        *,
        role:roles(*),
        agent_settings(*)
      `)
      .neq('role_id', (await supabase.from('roles').select('id').eq('name', 'super_admin').single()).data?.id)
      .order('created_at', { ascending: false });

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 角色筛选
    if (role && role !== 'all') {
      const roleData = await supabase.from('roles').select('id').eq('name', role).single();
      if (roleData.data) {
        query = query.eq('role_id', roleData.data.id);
      }
    }

    // 分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: agents, error, count } = await query;

    if (error) {
      throw error;
    }

    // 获取每个坐席的会话统计
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const { data: sessions } = await supabase
          .from('chat_sessions')
          .select('id, status')
          .eq('agent_id', agent.id);

        const currentSessions = sessions?.filter(s => s.status === 'active').length || 0;
        const totalSessions = sessions?.length || 0;

        return {
          ...agent,
          currentSessions,
          totalSessions,
          maxSessions: agent.agent_settings?.max_concurrent_sessions || 5
        };
      })
    );

    res.json({
      success: true,
      data: agentsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取坐席列表失败'
    });
  }
});

// 创建新坐席
router.post('/', requirePermission('agent.create'), async (req, res) => {
  try {
    const { name, email, roleId, maxSessions = 5 } = req.body;

    // 验证输入
    if (!name || !roleId) {
      return res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: '缺少必填字段'
      });
    }

    // 创建用户
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        role_id: roleId,
        status: 'offline'
      })
      .select(`
        *,
        role:roles(*)
      `)
      .single();

    if (userError) {
      throw userError;
    }

    // 创建坐席设置
    const { error: settingsError } = await supabase
      .from('agent_settings')
      .insert({
        agent_id: newUser.id,
        max_concurrent_sessions: maxSessions
      });

    if (settingsError) {
      console.error('Create agent settings error:', settingsError);
    }

    res.json({
      success: true,
      data: newUser,
      message: '坐席创建成功'
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '创建坐席失败'
    });
  }
});

// 更新坐席信息
router.put('/:id', requirePermission('agent.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, roleId, maxSessions } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (roleId !== undefined) updates.role_id = roleId;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'NO_UPDATES',
        message: '没有提供更新数据'
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedAgent, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        role:roles(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedAgent) {
      return res.status(404).json({
        error: 'AGENT_NOT_FOUND',
        message: '坐席不存在'
      });
    }

    // 更新坐席设置
    if (maxSessions !== undefined) {
      await supabase
        .from('agent_settings')
        .upsert({
          agent_id: id,
          max_concurrent_sessions: maxSessions
        });
    }

    res.json({
      success: true,
      data: updatedAgent,
      message: '坐席信息更新成功'
    });

  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '更新坐席信息失败'
    });
  }
});

// 删除坐席
router.delete('/:id', requirePermission('agent.delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否有活跃会话
    const { data: activeSessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('agent_id', id)
      .eq('status', 'active');

    if (activeSessions && activeSessions.length > 0) {
      return res.status(400).json({
        error: 'AGENT_HAS_ACTIVE_SESSIONS',
        message: '坐席有活跃会话，无法删除'
      });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: '坐席删除成功'
    });

  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '删除坐席失败'
    });
  }
});

// 更新坐席状态
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['online', 'busy', 'break', 'offline', 'training'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'INVALID_STATUS',
        message: '无效的状态值'
      });
    }

    const { data: updatedAgent, error } = await supabase
      .from('users')
      .update({
        status,
        is_online: ['online', 'busy'].includes(status),
        last_active_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedAgent) {
      return res.status(404).json({
        error: 'AGENT_NOT_FOUND',
        message: '坐席不存在'
      });
    }

    res.json({
      success: true,
      data: updatedAgent,
      message: '坐席状态更新成功'
    });

  } catch (error) {
    console.error('Update agent status error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '更新坐席状态失败'
    });
  }
});

export default router;