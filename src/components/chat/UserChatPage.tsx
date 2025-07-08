import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Paperclip, Image, Smile } from 'lucide-react';
import { api } from '../../utils/api';

interface UserChatPageProps {}

export const UserChatPage: React.FC<UserChatPageProps> = () => {
  const { agentId, shortId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgentInfo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let resolvedAgentId = agentId;
        
        // 如果是短链接，先解析获取真实的agentId
        if (shortId) {
          const shortLinkResponse = await api.shortlinks.resolve(shortId);
          
          if (shortLinkResponse.success && shortLinkResponse.data) {
            resolvedAgentId = shortLinkResponse.data.agentId;
            
            // 如果没有agentId，从originalUrl中提取
            if (!resolvedAgentId && shortLinkResponse.data.originalUrl) {
              const urlMatch = shortLinkResponse.data.originalUrl.match(/\/chat\/([^\/]+)/);
              if (urlMatch) {
                resolvedAgentId = urlMatch[1];
              }
            }
          } else {
            throw new Error('短链接无效或已过期');
          }
        }
        
        if (!resolvedAgentId) {
          throw new Error('无法获取客服信息');
        }
        
        // 这里应该调用API获取客服信息
        // 暂时使用模拟数据，后续可以添加获取客服信息的API
        const mockAgentInfo = {
          id: resolvedAgentId,
          name: '客服小助手',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          isOnline: true
        };
        
        setAgentInfo(mockAgentInfo);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载客服信息失败';
        setError(errorMessage);
        console.error('Load agent info error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAgentInfo();
  }, [agentId, shortId]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // 模拟客服回复
    setTimeout(() => {
      const agentReply = {
        id: (Date.now() + 1).toString(),
        content: '您好！我已经收到您的消息，请稍等片刻，我会尽快为您处理。',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentReply]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在连接客服...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Smile className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }
  
  if (!agentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">客服信息不可用</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={agentInfo.avatar} 
              alt={agentInfo.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              agentInfo.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{agentInfo.name}</h3>
            <p className="text-sm text-gray-500">
              {agentInfo.isOnline ? '在线' : '离线'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Smile className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500">开始与客服对话吧！</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Paperclip size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Image size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Smile size={16} />
            </button>
          </div>

          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};