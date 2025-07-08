import React, { useEffect } from 'react';
import { UserList } from '../chat/UserList';
import { ChatWindow } from '../chat/ChatWindow';
import { AgentHeader } from '../chat/AgentHeader';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';

export const AgentChatLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    loadCustomers,
    loadSessions,
    loadAgentSettings,
    setConnectionStatus
  } = useChatStore();

  useEffect(() => {
    // Load data from backend
    const initializeData = async () => {
      if (!user?.id) return;
      
      try {
        setConnectionStatus('connecting');
        
        // Load data in parallel
        await Promise.all([
          loadCustomers(),
          loadSessions(),
          loadAgentSettings(user.id)
        ]);
        
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to initialize chat data:', error);
        setConnectionStatus('disconnected');
      }
    };
    
    initializeData();
    
    // Set up periodic data refresh
    const refreshInterval = setInterval(() => {
      if (user?.id) {
        loadCustomers().catch(console.error);
        loadSessions().catch(console.error);
      }
    }, 30000); // Refresh every 30 seconds
    
    setConnectionStatus('connected');

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user, loadCustomers, loadSessions, loadAgentSettings, setConnectionStatus]);

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