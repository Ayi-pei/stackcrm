import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, Smile, MoreHorizontal, Info, MessageSquare } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { MessageList } from './MessageList';
import { QuickReplies } from './QuickReplies';
import { CustomerInfo } from './CustomerInfo';
import { FileUploadModal } from './FileUploadModal';
import { EmojiPicker } from './EmojiPicker';
import { ChatMessage } from '../../types/chat';

export const ChatWindow: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    customers, 
    activeSession, 
    selectedCustomerId, 
    messages, 
    addMessage,
    setTyping,
    agentSettings 
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const sessionMessages = activeSession ? messages[activeSession.id] || [] : [];

  // Handle typing indicator
  useEffect(() => {
    if (messageText.length > 0 && !isTyping) {
      setIsTyping(true);
      setTyping(true);
    } else if (messageText.length === 0 && isTyping) {
      setIsTyping(false);
      setTyping(false);
    }
  }, [messageText, isTyping, setTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [messageText]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeSession || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: activeSession.id,
      senderId: user.id,
      senderType: 'agent',
      content: messageText.trim(),
      type: 'text',
      timestamp: new Date(),
      status: 'sending'
    };

    addMessage(newMessage);
    setMessageText('');
    setIsTyping(false);
    setTyping(false);

    // Simulate message delivery
    setTimeout(() => {
      // Update message status to sent
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (content: string) => {
    setMessageText(content);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji: string) => {
    const newText = messageText + emoji;
    setMessageText(newText);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = (files: File[]) => {
    // Handle file upload logic here
    console.log('Files to upload:', files);
    setShowFileUpload(false);
  };

  if (!selectedCustomer) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <MoreHorizontal className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个用户开始聊天</h3>
          <p className="text-gray-500">从左侧用户列表中选择一个用户开始对话</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                {selectedCustomer.avatar ? (
                  <img 
                    src={selectedCustomer.avatar} 
                    alt={selectedCustomer.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    {selectedCustomer.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                selectedCustomer.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">{selectedCustomer.name}</h3>
              <p className="text-sm text-gray-500">
                {selectedCustomer.isOnline ? '在线' : '离线'}
                {activeSession?.isTyping && ' • 正在输入...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="快捷回复"
            >
              <MessageSquare size={16} />
            </button>
            
            <button
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="用户信息"
            >
              <Info size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <MessageList messages={sessionMessages} />
          </div>

          {/* Quick Replies - Now positioned at top */}
          {showQuickReplies && (
            <div className="border-t border-gray-200">
              <QuickReplies 
                quickReplies={agentSettings?.quickReplies || []}
                onSelect={handleQuickReply}
                onClose={() => setShowQuickReplies(false)}
              />
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="border-t border-gray-200 p-4">
              <EmojiPicker 
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end space-x-2">
              <div className="flex space-x-1">
                <button
                  onClick={() => setShowFileUpload(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="上传文件"
                >
                  <Paperclip size={16} />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="上传图片"
                >
                  <Image size={16} />
                </button>
                
                <button
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowQuickReplies(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="表情"
                >
                  <Smile size={16} />
                </button>
              </div>

              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息..."
                  className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  style={{ maxHeight: '120px' }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Customer Info Sidebar */}
        {showCustomerInfo && (
          <div className="w-80 border-l border-gray-200 bg-white">
            <CustomerInfo customer={selectedCustomer} />
          </div>
        )}
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUploadModal
          onUpload={handleFileUpload}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
};