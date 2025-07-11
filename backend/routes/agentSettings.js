import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// 获取指定坐席的设置
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    // 获取坐席设置
    const { data: settings, error: settingsError } = await supabase
      .from('agent_settings')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError;
    }

    // 获取快捷回复
    const { data: quickReplies, error: quickRepliesError } = await supabase
      .from('quick_replies')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (quickRepliesError) {
      throw quickRepliesError;
    }

    // 获取欢迎语
    const { data: welcomeMessages, error: welcomeMessagesError } = await supabase
      .from('welcome_messages')
      .select('*')
      .eq('agent_id', agentId)
      .order('display_order', { ascending: true });

    if (welcomeMessagesError) {
      throw welcomeMessagesError;
    }

    // 如果没有设置记录，创建默认设置
    let agentSettings = settings;
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('agent_settings')
        .insert({
          agent_id: agentId,
          auto_welcome_enabled: true,
          sound_notifications: true,
          auto_reply_enabled: false,
          max_concurrent_sessions: 5,
          break_duration: 15
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      agentSettings = newSettings;
    }

    res.json({
      success: true,
      data: {
        settings: agentSettings,
        quickReplies: quickReplies || [],
        welcomeMessages: welcomeMessages || []
      }
    });

  } catch (error) {
    console.error('Get agent settings error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取坐席设置失败'
    });
  }
});

// 更新坐席设置
router.put('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const {
      autoWelcomeEnabled,
      soundNotifications,
      autoReplyEnabled,
      maxConcurrentSessions,
      workingHours,
      breakDuration
    } = req.body;

    const updates = {};
    if (autoWelcomeEnabled !== undefined) updates.auto_welcome_enabled = autoWelcomeEnabled;
    if (soundNotifications !== undefined) updates.sound_notifications = soundNotifications;
    if (autoReplyEnabled !== undefined) updates.auto_reply_enabled = autoReplyEnabled;
    if (maxConcurrentSessions !== undefined) updates.max_concurrent_sessions = maxConcurrentSessions;
    if (workingHours !== undefined) updates.working_hours = workingHours;
    if (breakDuration !== undefined) updates.break_duration = breakDuration;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'NO_UPDATES',
        message: '没有提供更新数据'
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedSettings, error } = await supabase
      .from('agent_settings')
      .upsert({
        agent_id: agentId,
        ...updates
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: updatedSettings,
      message: '坐席设置更新成功'
    });

  } catch (error) {
    console.error('Update agent settings error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '更新坐席设置失败'
    });
  }
});

// 添加快捷回复
router.post('/:agentId/quick-replies', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: '标题和内容不能为空'
      });
    }

    const { data: newQuickReply, error } = await supabase
      .from('quick_replies')
      .insert({
        agent_id: agentId,
        title,
        content,
        category: category || '默认',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: newQuickReply,
      message: '快捷回复添加成功'
    });

  } catch (error) {
    console.error('Add quick reply error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '添加快捷回复失败'
    });
  }
});

// 更新快捷回复
router.put('/:agentId/quick-replies/:id', async (req, res) => {
  try {
    const { agentId, id } = req.params;
    const { title, content, category, isActive } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (isActive !== undefined) updates.is_active = isActive;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'NO_UPDATES',
        message: '没有提供更新数据'
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedQuickReply, error } = await supabase
      .from('quick_replies')
      .update(updates)
      .eq('id', id)
      .eq('agent_id', agentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedQuickReply) {
      return res.status(404).json({
        error: 'QUICK_REPLY_NOT_FOUND',
        message: '快捷回复不存在'
      });
    }

    res.json({
      success: true,
      data: updatedQuickReply,
      message: '快捷回复更新成功'
    });

  } catch (error) {
    console.error('Update quick reply error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '更新快捷回复失败'
    });
  }
});

// 删除快捷回复
router.delete('/:agentId/quick-replies/:id', async (req, res) => {
  try {
    const { agentId, id } = req.params;

    const { error } = await supabase
      .from('quick_replies')
      .delete()
      .eq('id', id)
      .eq('agent_id', agentId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: '快捷回复删除成功'
    });

  } catch (error) {
    console.error('Delete quick reply error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '删除快捷回复失败'
    });
  }
});

// 添加欢迎语
router.post('/:agentId/welcome-messages', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { content, displayOrder, isEnabled = true } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'MISSING_CONTENT',
        message: '欢迎语内容不能为空'
      });
    }

    // 如果没有指定顺序，获取下一个顺序号
    let order = displayOrder;
    if (!order) {
      const { data: lastMessage } = await supabase
        .from('welcome_messages')
        .select('display_order')
        .eq('agent_id', agentId)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      order = (lastMessage?.display_order || 0) + 1;
    }

    const { data: newWelcomeMessage, error } = await supabase
      .from('welcome_messages')
      .insert({
        agent_id: agentId,
        content,
        display_order: order,
        is_enabled: isEnabled
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: newWelcomeMessage,
      message: '欢迎语添加成功'
    });

  } catch (error) {
    console.error('Add welcome message error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '添加欢迎语失败'
    });
  }
});

// 更新欢迎语
router.put('/:agentId/welcome-messages/:id', async (req, res) => {
  try {
    const { agentId, id } = req.params;
    const { content, displayOrder, isEnabled } = req.body;

    const updates = {};
    if (content !== undefined) updates.content = content;
    if (displayOrder !== undefined) updates.display_order = displayOrder;
    if (isEnabled !== undefined) updates.is_enabled = isEnabled;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'NO_UPDATES',
        message: '没有提供更新数据'
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedWelcomeMessage, error } = await supabase
      .from('welcome_messages')
      .update(updates)
      .eq('id', id)
      .eq('agent_id', agentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedWelcomeMessage) {
      return res.status(404).json({
        error: 'WELCOME_MESSAGE_NOT_FOUND',
        message: '欢迎语不存在'
      });
    }

    res.json({
      success: true,
      data: updatedWelcomeMessage,
      message: '欢迎语更新成功'
    });

  } catch (error) {
    console.error('Update welcome message error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '更新欢迎语失败'
    });
  }
});

// 删除欢迎语
router.delete('/:agentId/welcome-messages/:id', async (req, res) => {
  try {
    const { agentId, id } = req.params;

    const { error } = await supabase
      .from('welcome_messages')
      .delete()
      .eq('id', id)
      .eq('agent_id', agentId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: '欢迎语删除成功'
    });

  } catch (error) {
    console.error('Delete welcome message error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '删除欢迎语失败'
    });
  }
});

// 添加到黑名单
router.post('/:agentId/blacklist', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        error: 'MISSING_CUSTOMER_ID',
        message: '客户ID不能为空'
      });
    }

    // 更新客户黑名单状态
    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update({ is_blacklisted: true })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedCustomer) {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND',
        message: '客户不存在'
      });
    }

    res.json({
      success: true,
      data: updatedCustomer,
      message: '已添加到黑名单'
    });

  } catch (error) {
    console.error('Add to blacklist error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '添加到黑名单失败'
    });
  }
});

// 从黑名单移除
router.delete('/:agentId/blacklist/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update({ is_blacklisted: false })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedCustomer) {
      return res.status(404).json({
        error: 'CUSTOMER_NOT_FOUND',
        message: '客户不存在'
      });
    }

    res.json({
      success: true,
      data: updatedCustomer,
      message: '已从黑名单移除'
    });

  } catch (error) {
    console.error('Remove from blacklist error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '从黑名单移除失败'
    });
  }
});

export default router;