import React, { useEffect } from 'react';
import { UserList } from '../chat/UserList';
import { ChatWindow } from '../chat/ChatWindow';
import { AgentHeader } from '../chat/AgentHeader';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';

export const AgentChatLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    setCustomers, 
    setSessions, 
    setAgentSettings,
    setConnectionStatus 
  } = useChatStore();

  useEffect(() => {
    // Initialize mock data for demonstration
    const mockCustomers = [
      {
        id: '1',
        name: '张小明',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        email: 'zhang@example.com',
        isOnline: true,
        lastSeen: new Date(),
        ipAddress: '192.168.1.100',
        device: 'iPhone 14',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        location: '北京市',
        hasReceivedWelcome: false
      },
      {
        id: '2',
        name: '李小红',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        email: 'li@example.com',
        isOnline: false,
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        ipAddress: '192.168.1.101',
        device: 'Samsung Galaxy S23',
        userAgent: 'Mozilla/5.0 (Linux; Android 13)',
        location: '上海市',
        hasReceivedWelcome: true
      },
      {
        id: '3',
        name: '王大华',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        isOnline: true,
        lastSeen: new Date(),
        ipAddress: '192.168.1.102',
        device: 'MacBook Pro',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        location: '广州市',
        hasReceivedWelcome: false
      }
    ];

    const mockSessions = [
      {
        id: 'session-1',
        customerId: '1',
        agentId: user?.id || '',
        status: 'active' as const,
        startTime: new Date(Date.now() - 600000), // 10 minutes ago
        lastMessageTime: new Date(Date.now() - 60000), // 1 minute ago
        unreadCount: 2,
        isTyping: false,
        welcomeMessageSent: false
      },
      {
        id: 'session-2',
        customerId: '2',
        agentId: user?.id || '',
        status: 'waiting' as const,
        startTime: new Date(Date.now() - 300000), // 5 minutes ago
        lastMessageTime: new Date(Date.now() - 300000),
        unreadCount: 1,
        isTyping: false,
        welcomeMessageSent: true
      }
    ];

    const mockAgentSettings = {
      id: 'settings-1',
      agentId: user?.id || '',
      welcomeMessage: '您好！欢迎咨询，我是您的专属客服，有什么可以帮助您的吗？',
      autoReply: true,
      soundNotifications: true,
      autoWelcomeEnabled: true,
      welcomeMessages: [
        {
          id: 'welcome-1',
          content: '您好！欢迎咨询，我是您的专属客服。',
          isEnabled: true,
          order: 1
        },
        {
          id: 'welcome-2',
          content: '我是专业的客服顾问，有什么可以帮助您的吗？',
          isEnabled: true,
          order: 2
        },
        {
          id: 'welcome-3',
          content: '如果您有任何问题，请随时告诉我，我会尽力为您解答。',
          isEnabled: true,
          order: 3
        }
      ],
      quickReplies: [
        {
          id: 'qr-1',
          title: '问候语',
          content: '您好！很高兴为您服务，请问有什么可以帮助您的吗？',
          category: '常用',
          agentId: user?.id || ''
        },
        {
          id: 'qr-2',
          title: '稍等回复',
          content: '好的，请稍等，我马上为您查询处理。',
          category: '常用',
          agentId: user?.id || ''
        },
        {
          id: 'qr-3',
          title: '感谢语',
          content: '感谢您的咨询，如果还有其他问题，随时联系我们！',
          category: '常用',
          agentId: user?.id || ''
        }
      ],
      blacklistedUsers: []
    };

    setCustomers(mockCustomers);
    setSessions(mockSessions);
    setAgentSettings(mockAgentSettings);
    setConnectionStatus('connected');

    // Simulate real-time connection
    const connectionInterval = setInterval(() => {
      setConnectionStatus('connected');
    }, 30000);

    return () => clearInterval(connectionInterval);
  }, [user, setCustomers, setSessions, setAgentSettings, setConnectionStatus]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AgentHeader />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-gray-200 bg-white">
          <UserList />
        </div>
        <div className="flex-1">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};