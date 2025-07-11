import React from 'react';
import { Search, Circle, Clock } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const UserList: React.FC = () => {
  const { 
    customers, 
    sessions, 
    selectedCustomerId, 
    selectCustomer,
    messages 
  } = useChatStore();

  const getSessionForCustomer = (customerId: string) => {
    return sessions.find(session => session.customerId === customerId);
  };

  const getLastMessage = (sessionId: string) => {
    const sessionMessages = messages[sessionId] || [];
    return sessionMessages[sessionMessages.length - 1];
  };

  const getUnreadCount = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.unreadCount || 0;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {customers.map((customer) => {
          const session = getSessionForCustomer(customer.id);
          const lastMessage = session ? getLastMessage(session.id) : null;
          const unreadCount = session ? getUnreadCount(session.id) : 0;
          const isSelected = selectedCustomerId === customer.id;

          return (
            <div
              key={customer.id}
              onClick={() => selectCustomer(customer.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    {customer.avatar ? (
                      <img 
                        src={customer.avatar} 
                        alt={customer.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        {customer.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    customer.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customer.name || '未知用户'}
                    </p>
                    {session && (
                      <div className="flex items-center space-x-1">
                        {session.status === 'waiting' && (
                          <Clock size={12} className="text-orange-500" />
                        )}
                        {session.isTyping && (
                          <div className="flex space-x-1">
                            <Circle size={4} className="text-blue-500 animate-bounce" />
                            <Circle size={4} className="text-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <Circle size={4} className="text-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        )}
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">
                      {lastMessage ? (
                        lastMessage.type === 'text' ? lastMessage.content : `[${lastMessage.type}]`
                      ) : (
                        session?.status === 'waiting' ? '等待接入...' : '暂无消息'
                      )}
                    </p>
                    {session && (
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(session.lastMessageTime, { 
                          addSuffix: true, 
                          locale: zhCN 
                        })}
                      </p>
                    )}
                  </div>

                  {session?.status === 'waiting' && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        等待接入
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {customers.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <Circle className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500">暂无用户</p>
          </div>
        </div>
      )}
    </div>
  );
};