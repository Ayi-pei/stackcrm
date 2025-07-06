import { create } from 'zustand';
import { Customer, ChatMessage, ChatSession, QuickReply, AgentSettings, FileUpload, WelcomeMessage } from '../types/chat';

interface ChatState {
  // Customers and sessions
  customers: Customer[];
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  messages: { [sessionId: string]: ChatMessage[] };
  
  // Agent settings
  agentSettings: AgentSettings | null;
  
  // UI state
  selectedCustomerId: string | null;
  isTyping: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  
  // File uploads
  fileUploads: FileUpload[];
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setActiveSession: (session: ChatSession | null) => void;
  selectCustomer: (customerId: string) => void;
  
  // Messages
  addMessage: (message: ChatMessage) => void;
  updateMessageStatus: (messageId: string, status: ChatMessage['status']) => void;
  setMessages: (sessionId: string, messages: ChatMessage[]) => void;
  
  // Typing indicators
  setTyping: (isTyping: boolean) => void;
  setCustomerTyping: (sessionId: string, isTyping: boolean) => void;
  
  // Agent settings
  setAgentSettings: (settings: AgentSettings) => void;
  updateQuickReplies: (quickReplies: QuickReply[]) => void;
  addToBlacklist: (customerId: string) => void;
  removeFromBlacklist: (customerId: string) => void;
  
  // Welcome messages
  updateWelcomeMessages: (welcomeMessages: WelcomeMessage[]) => void;
  toggleAutoWelcome: (enabled: boolean) => void;
  sendWelcomeMessages: (sessionId: string, customerId: string) => void;
  markCustomerWelcomed: (customerId: string) => void;
  
  // File uploads
  addFileUpload: (upload: FileUpload) => void;
  updateFileUpload: (id: string, updates: Partial<FileUpload>) => void;
  removeFileUpload: (id: string) => void;
  
  // Connection
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  customers: [],
  sessions: [],
  activeSession: null,
  messages: {},
  agentSettings: null,
  selectedCustomerId: null,
  isTyping: false,
  connectionStatus: 'disconnected',
  fileUploads: [],

  setCustomers: (customers) => set({ customers }),
  
  setSessions: (sessions) => set({ sessions }),
  
  setActiveSession: (session) => set({ activeSession: session }),
  
  selectCustomer: (customerId) => {
    const { sessions, agentSettings } = get();
    const session = sessions.find(s => s.customerId === customerId);
    
    set({ 
      selectedCustomerId: customerId,
      activeSession: session || null
    });

    // 检查是否需要发送自动欢迎语
    if (session && agentSettings?.autoWelcomeEnabled && !session.welcomeMessageSent) {
      get().sendWelcomeMessages(session.id, customerId);
    }
  },
  
  addMessage: (message) => set((state) => ({
    messages: {
      ...state.messages,
      [message.sessionId]: [...(state.messages[message.sessionId] || []), message]
    }
  })),
  
  updateMessageStatus: (messageId, status) => set((state) => {
    const newMessages = { ...state.messages };
    Object.keys(newMessages).forEach(sessionId => {
      newMessages[sessionId] = newMessages[sessionId].map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      );
    });
    return { messages: newMessages };
  }),
  
  setMessages: (sessionId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [sessionId]: messages
    }
  })),
  
  setTyping: (isTyping) => set({ isTyping }),
  
  setCustomerTyping: (sessionId, isTyping) => set((state) => ({
    sessions: state.sessions.map(session =>
      session.id === sessionId 
        ? { ...session, isTyping, typingUser: isTyping ? 'customer' : undefined }
        : session
    )
  })),
  
  setAgentSettings: (settings) => set({ agentSettings: settings }),
  
  updateQuickReplies: (quickReplies) => set((state) => ({
    agentSettings: state.agentSettings 
      ? { ...state.agentSettings, quickReplies }
      : null
  })),
  
  addToBlacklist: (customerId) => set((state) => ({
    agentSettings: state.agentSettings
      ? {
          ...state.agentSettings,
          blacklistedUsers: [...state.agentSettings.blacklistedUsers, customerId]
        }
      : null
  })),
  
  removeFromBlacklist: (customerId) => set((state) => ({
    agentSettings: state.agentSettings
      ? {
          ...state.agentSettings,
          blacklistedUsers: state.agentSettings.blacklistedUsers.filter(id => id !== customerId)
        }
      : null
  })),

  // Welcome messages functions
  updateWelcomeMessages: (welcomeMessages) => set((state) => ({
    agentSettings: state.agentSettings
      ? { ...state.agentSettings, welcomeMessages }
      : null
  })),

  toggleAutoWelcome: (enabled) => set((state) => ({
    agentSettings: state.agentSettings
      ? { ...state.agentSettings, autoWelcomeEnabled: enabled }
      : null
  })),

  sendWelcomeMessages: (sessionId, customerId) => {
    const { agentSettings, customers, addMessage, sessions } = get();
    
    if (!agentSettings?.autoWelcomeEnabled || !agentSettings.welcomeMessages.length) {
      return;
    }

    // 检查客户是否已经收到过欢迎语
    const customer = customers.find(c => c.id === customerId);
    if (customer?.hasReceivedWelcome) {
      return;
    }

    // 按顺序发送所有启用的欢迎语
    const enabledWelcomeMessages = agentSettings.welcomeMessages
      .filter(wm => wm.isEnabled)
      .sort((a, b) => a.order - b.order);

    enabledWelcomeMessages.forEach((welcomeMsg, index) => {
      setTimeout(() => {
        const message: ChatMessage = {
          id: `welcome-${Date.now()}-${index}`,
          sessionId,
          senderId: agentSettings.agentId,
          senderType: 'agent',
          content: welcomeMsg.content,
          type: 'text',
          timestamp: new Date(),
          status: 'sent',
          isWelcomeMessage: true
        };
        
        addMessage(message);
      }, index * 1000); // 每条消息间隔1秒发送
    });

    // 标记客户已收到欢迎语
    get().markCustomerWelcomed(customerId);
    
    // 标记会话已发送欢迎语
    set((state) => ({
      sessions: state.sessions.map(session =>
        session.id === sessionId
          ? { ...session, welcomeMessageSent: true }
          : session
      )
    }));
  },

  markCustomerWelcomed: (customerId) => set((state) => ({
    customers: state.customers.map(customer =>
      customer.id === customerId
        ? { ...customer, hasReceivedWelcome: true }
        : customer
    )
  })),
  
  addFileUpload: (upload) => set((state) => ({
    fileUploads: [...state.fileUploads, upload]
  })),
  
  updateFileUpload: (id, updates) => set((state) => ({
    fileUploads: state.fileUploads.map(upload =>
      upload.id === id ? { ...upload, ...updates } : upload
    )
  })),
  
  removeFileUpload: (id) => set((state) => ({
    fileUploads: state.fileUploads.filter(upload => upload.id !== id)
  })),
  
  setConnectionStatus: (status) => set({ connectionStatus: status })
}));