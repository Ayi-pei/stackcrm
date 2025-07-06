import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const setupSocketHandlers = (io) => {
  // Socket认证中间件
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 获取用户信息
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userRole = user.role?.name || 'agent';
      socket.userName = user.name;
      socket.isAdmin = decoded.type === 'admin';
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`用户 ${socket.userName} 已连接 (${socket.id})`);

    // 加入用户房间
    socket.join(`user_${socket.userId}`);

    // 如果是坐席，加入坐席房间
    if (!socket.isAdmin) {
      socket.join('agents');
    }

    // 管理员加入管理员房间
    if (socket.isAdmin) {
      socket.join('admins');
    }

    // 更新用户在线状态
    updateUserOnlineStatus(socket.userId, true);

    // 处理聊天消息
    socket.on('send_message', async (data) => {
      try {
        const { sessionId, content, type = 'text' } = data;

        // 保存消息到数据库
        const { data: message, error } = await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            sender_id: socket.userId,
            sender_type: socket.isAdmin ? 'agent' : 'agent',
            content,
            message_type: type,
            status: 'sent'
          })
          .select()
          .single();

        if (error) {
          socket.emit('message_error', { error: 'Failed to save message' });
          return;
        }

        // 获取会话信息
        const { data: session } = await supabase
          .from('chat_sessions')
          .select('customer_id, agent_id')
          .eq('id', sessionId)
          .single();

        if (session) {
          // 发送给会话中的其他参与者
          const targetUserId = socket.userId === session.agent_id ? session.customer_id : session.agent_id;
          
          if (targetUserId) {
            io.to(`user_${targetUserId}`).emit('new_message', {
              ...message,
              sender_name: socket.userName
            });
          }

          // 更新会话最后消息时间
          await supabase
            .from('chat_sessions')
            .update({ 
              last_message_at: new Date().toISOString(),
              message_count: supabase.raw('message_count + 1')
            })
            .eq('id', sessionId);
        }

        // 确认消息发送成功
        socket.emit('message_sent', { messageId: message.id });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // 处理输入状态
    socket.on('typing_start', async (data) => {
      const { sessionId } = data;
      
      // 获取会话信息并通知其他参与者
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('customer_id, agent_id')
        .eq('id', sessionId)
        .single();

      if (session) {
        const targetUserId = socket.userId === session.agent_id ? session.customer_id : session.agent_id;
        if (targetUserId) {
          io.to(`user_${targetUserId}`).emit('user_typing', {
            sessionId,
            userId: socket.userId,
            userName: socket.userName
          });
        }
      }
    });

    socket.on('typing_stop', async (data) => {
      const { sessionId } = data;
      
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('customer_id, agent_id')
        .eq('id', sessionId)
        .single();

      if (session) {
        const targetUserId = socket.userId === session.agent_id ? session.customer_id : session.agent_id;
        if (targetUserId) {
          io.to(`user_${targetUserId}`).emit('user_stop_typing', {
            sessionId,
            userId: socket.userId
          });
        }
      }
    });

    // 处理会话分配（仅管理员和主管）
    socket.on('assign_session', async (data) => {
      if (!socket.isAdmin && !['supervisor'].includes(socket.userRole)) {
        socket.emit('error', { message: 'Insufficient permissions' });
        return;
      }

      try {
        const { sessionId, agentId } = data;

        // 更新会话分配
        const { error } = await supabase
          .from('chat_sessions')
          .update({ 
            agent_id: agentId,
            status: 'active'
          })
          .eq('id', sessionId);

        if (error) {
          socket.emit('assignment_error', { error: 'Failed to assign session' });
          return;
        }

        // 通知相关用户
        io.to(`user_${agentId}`).emit('session_assigned', {
          sessionId,
          assignedBy: socket.userName
        });

        io.to('admins').emit('session_assignment_updated', {
          sessionId,
          agentId,
          assignedBy: socket.userName
        });

        socket.emit('assignment_success', { sessionId, agentId });

      } catch (error) {
        console.error('Assign session error:', error);
        socket.emit('assignment_error', { error: 'Failed to assign session' });
      }
    });

    // 处理状态更新
    socket.on('update_status', async (data) => {
      try {
        const { status } = data;
        
        // 更新用户状态
        await supabase
          .from('users')
          .update({ status })
          .eq('id', socket.userId);

        // 通知管理员状态变更
        io.to('admins').emit('agent_status_updated', {
          userId: socket.userId,
          userName: socket.userName,
          status
        });

        socket.emit('status_updated', { status });

      } catch (error) {
        console.error('Update status error:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // 处理断开连接
    socket.on('disconnect', () => {
      console.log(`用户 ${socket.userName} 已断开连接 (${socket.id})`);
      
      // 更新用户离线状态
      updateUserOnlineStatus(socket.userId, false);
      
      // 通知其他用户
      socket.broadcast.emit('user_disconnected', {
        userId: socket.userId,
        userName: socket.userName
      });
    });
  });
};

// 更新用户在线状态
async function updateUserOnlineStatus(userId, isOnline) {
  try {
    await supabase
      .from('users')
      .update({ 
        is_online: isOnline,
        last_active_at: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Update online status error:', error);
  }
}