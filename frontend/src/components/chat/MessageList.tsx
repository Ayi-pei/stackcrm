import React, { useEffect, useRef } from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock size={12} className="text-gray-400" />;
      case 'sent':
        return <Check size={12} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={12} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={12} className="text-blue-500" />;
      case 'failed':
        return <AlertCircle size={12} className="text-red-500" />;
      default:
        return null;
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isAgent = message.senderType === 'agent';
    const isCurrentUser = message.senderId === user?.id;

    if (message.senderType === 'system') {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          <div className={`px-4 py-2 rounded-lg ${
            isCurrentUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            {message.type === 'text' && (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
            
            {message.type === 'image' && (
              <div>
                <img 
                  src={message.fileUrl} 
                  alt="图片消息"
                  className="max-w-full h-auto rounded"
                />
                {message.content && (
                  <p className="text-sm mt-2">{message.content}</p>
                )}
              </div>
            )}
            
            {message.type === 'file' && (
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{message.fileName}</p>
                  <p className="text-xs opacity-75">
                    {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ''}
                  </p>
                </div>
                <button className="text-xs underline">下载</button>
              </div>
            )}
          </div>
          
          <div className={`flex items-center mt-1 space-x-1 ${
            isCurrentUser ? 'justify-end' : 'justify-start'
          }`}>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: zhCN })}
            </span>
            {isCurrentUser && getStatusIcon(message.status)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 mb-2">还没有消息</p>
            <p className="text-sm text-gray-400">发送第一条消息开始对话</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};