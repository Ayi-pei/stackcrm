import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// 获取客户列表
router.get('/customers', async (req, res) => {
  try {
    const { isOnline, isBlacklisted, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('customers')
      .select('*')
      .order('last_seen_at', { ascending: false });

    // 在线状态筛选
    if (isOnline !== undefined) {
      query = query.eq('is_online', isOnline === 'true');
    }

    // 黑名单筛选
    if (isBlacklisted !== undefined) {
      query = query.eq('is_blacklisted', isBlacklisted === 'true');
    }

    // 分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: customers, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取客户列表失败'
    });
  }
});

// 获取会话列表
router.get('/sessions', async (req, res) => {
  try {
    const { status, agentId, customerId, page = 1, limit = 50 } = req.query;
    
    let query = supabase
      .from('chat_sessions')
      .select(`
        *,
        customer:customers(*),
        agent:users(id, name, avatar_url)
      `)
      .order('started_at', { ascending: false });

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 坐席筛选
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    // 客户筛选
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    // 分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: sessions, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取会话列表失败'
    });
  }
});

// 获取指定会话的消息记录
router.get('/sessions/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 100 } = req.query;

    const offset = (page - 1) * limit;

    const { data: messages, error, count } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });

  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取消息记录失败'
    });
  }
});

// 发送新消息到指定会话
router.post('/sessions/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, messageType = 'text', fileUrl, fileName, fileSize, fileType } = req.body;

    if (!content && !fileUrl) {
      return res.status(400).json({
        error: 'MISSING_CONTENT',
        message: '消息内容不能为空'
      });
    }

    // 验证会话存在
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        error: 'SESSION_NOT_FOUND',
        message: '会话不存在'
      });
    }

    // 创建消息
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: id,
        sender_id: req.user.id,
        sender_type: req.user.type === 'admin' ? 'agent' : 'agent',
        content,
        message_type: messageType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        status: 'sent'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 更新会话最后消息时间和消息计数
    await supabase
      .from('chat_sessions')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: supabase.raw('message_count + 1')
      })
      .eq('id', id);

    res.json({
      success: true,
      data: newMessage,
      message: '消息发送成功'
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '发送消息失败'
    });
  }
});

// 将会话分配给指定坐席
router.post('/sessions/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        error: 'MISSING_AGENT_ID',
        message: '请指定坐席ID'
      });
    }

    // 验证坐席存在且可用
    const { data: agent, error: agentError } = await supabase
      .from('users')
      .select('*, agent_settings(*)')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return res.status(404).json({
        error: 'AGENT_NOT_FOUND',
        message: '坐席不存在'
      });
    }

    // 检查坐席当前会话数
    const { data: currentSessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('agent_id', agentId)
      .eq('status', 'active');

    const maxSessions = agent.agent_settings?.max_concurrent_sessions || 5;
    if (currentSessions && currentSessions.length >= maxSessions) {
      return res.status(400).json({
        error: 'AGENT_AT_CAPACITY',
        message: '坐席已达到最大会话数'
      });
    }

    // 分配会话
    const { data: updatedSession, error } = await supabase
      .from('chat_sessions')
      .update({
        agent_id: agentId,
        status: 'active'
      })
      .eq('id', id)
      .select(`
        *,
        customer:customers(*),
        agent:users(id, name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!updatedSession) {
      return res.status(404).json({
        error: 'SESSION_NOT_FOUND',
        message: '会话不存在'
      });
    }

    res.json({
      success: true,
      data: updatedSession,
      message: '会话分配成功'
    });

  } catch (error) {
    console.error('Assign session error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '分配会话失败'
    });
  }
});

export default router;