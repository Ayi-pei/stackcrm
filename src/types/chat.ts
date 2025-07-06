export interface Customer {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  isOnline: boolean;
  lastSeen: Date;
  ipAddress?: string;
  device?: string;
  userAgent?: string;
  location?: string;
  isBlacklisted?: boolean;
  hasReceivedWelcome?: boolean; // 新增：是否已收到欢迎语
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isWelcomeMessage?: boolean; // 新增：标识是否为欢迎语消息
}

export interface ChatSession {
  id: string;
  customerId: string;
  agentId: string;
  status: 'waiting' | 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  lastMessageTime: Date;
  unreadCount: number;
  isTyping: boolean;
  typingUser?: string;
  welcomeMessageSent?: boolean; // 新增：是否已发送欢迎语
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
  category?: string;
  agentId: string;
}

export interface WelcomeMessage {
  id: string;
  content: string;
  isEnabled: boolean;
  order: number; // 发送顺序
}

export interface AgentSettings {
  id: string;
  agentId: string;
  welcomeMessage: string;
  autoReply: boolean;
  soundNotifications: boolean;
  quickReplies: QuickReply[];
  blacklistedUsers: string[];
  // 新增：自动欢迎语设置
  autoWelcomeEnabled: boolean;
  welcomeMessages: WelcomeMessage[];
}

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  url?: string;
}