import { create } from 'zustand';
import { Session, Message, AssignmentStrategy } from '../types';

interface SessionState {
  sessions: Session[];
  activeSessions: Session[];
  waitingQueue: Session[];
  selectedSession: Session | null;
  messages: { [sessionId: string]: Message[] };
  loading: boolean;
  error: string | null;
  
  // Actions
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  removeSession: (id: string) => void;
  selectSession: (session: Session | null) => void;
  
  // Messages
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  
  // Queue management
  addToQueue: (session: Session) => void;
  removeFromQueue: (sessionId: string) => void;
  assignSession: (sessionId: string, agentId: string) => void;
  
  // Utilities
  getSessionsByAgent: (agentId: string) => Session[];
  getActiveSessionsCount: (agentId: string) => number;
  getWaitingTime: (sessionId: string) => number;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSessions: [],
  waitingQueue: [],
  selectedSession: null,
  messages: {},
  loading: false,
  error: null,

  setSessions: (sessions) => {
    const activeSessions = sessions.filter(s => s.status === 'active');
    const waitingQueue = sessions.filter(s => s.status === 'waiting');
    
    set({ 
      sessions, 
      activeSessions, 
      waitingQueue 
    });
  },
  
  addSession: (session) => set((state) => {
    const newSessions = [...state.sessions, session];
    const activeSessions = newSessions.filter(s => s.status === 'active');
    const waitingQueue = newSessions.filter(s => s.status === 'waiting');
    
    return {
      sessions: newSessions,
      activeSessions,
      waitingQueue
    };
  }),
  
  updateSession: (id, updates) => set((state) => {
    const newSessions = state.sessions.map(session => 
      session.id === id ? { ...session, ...updates } : session
    );
    const activeSessions = newSessions.filter(s => s.status === 'active');
    const waitingQueue = newSessions.filter(s => s.status === 'waiting');
    
    return {
      sessions: newSessions,
      activeSessions,
      waitingQueue
    };
  }),
  
  removeSession: (id) => set((state) => {
    const newSessions = state.sessions.filter(session => session.id !== id);
    const activeSessions = newSessions.filter(s => s.status === 'active');
    const waitingQueue = newSessions.filter(s => s.status === 'waiting');
    
    return {
      sessions: newSessions,
      activeSessions,
      waitingQueue
    };
  }),
  
  selectSession: (session) => set({ selectedSession: session }),
  
  addMessage: (sessionId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [sessionId]: [...(state.messages[sessionId] || []), message]
    }
  })),
  
  updateMessage: (sessionId, messageId, updates) => set((state) => ({
    messages: {
      ...state.messages,
      [sessionId]: (state.messages[sessionId] || []).map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }
  })),
  
  setMessages: (sessionId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [sessionId]: messages
    }
  })),
  
  addToQueue: (session) => set((state) => ({
    waitingQueue: [...state.waitingQueue, session]
  })),
  
  removeFromQueue: (sessionId) => set((state) => ({
    waitingQueue: state.waitingQueue.filter(session => session.id !== sessionId)
  })),
  
  assignSession: (sessionId, agentId) => set((state) => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return state;
    
    const updatedSession = { 
      ...session, 
      agentId, 
      status: 'active' as const 
    };
    
    const newSessions = state.sessions.map(s => 
      s.id === sessionId ? updatedSession : s
    );
    
    return {
      sessions: newSessions,
      activeSessions: newSessions.filter(s => s.status === 'active'),
      waitingQueue: newSessions.filter(s => s.status === 'waiting')
    };
  }),
  
  getSessionsByAgent: (agentId) => {
    const { sessions } = get();
    return sessions.filter(session => session.agentId === agentId);
  },
  
  getActiveSessionsCount: (agentId) => {
    const { activeSessions } = get();
    return activeSessions.filter(session => session.agentId === agentId).length;
  },
  
  getWaitingTime: (sessionId) => {
    const { sessions } = get();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return 0;
    
    return Date.now() - session.startTime.getTime();
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));