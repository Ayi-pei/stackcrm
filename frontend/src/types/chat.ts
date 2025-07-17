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
  hasReceivedWelcome?: boolean;
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
  isWelcomeMessage?: boolean;
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
  welcomeMessageSent?: boolean;
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
  order: number;
}

export interface AgentSettings {
  id: string;
  agentId: string;
  welcomeMessage: string;
  autoReply: boolean;
  soundNotifications: boolean;
  quickReplies: QuickReply[];
  blacklistedUsers: string[];
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