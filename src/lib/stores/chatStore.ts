// Chat store for managing chat messages and state
import { writable, derived, get } from 'svelte/store';

// Define chat message type
export interface ChatMessage {
  type: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  images?: string[];
}

// Define chat session interface
export interface ChatSession {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  imageId?: string; // Reference to associated image
}

// Define chat state interface
interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  prompt: string;
  error: string;
}

// Create a new session
function createNewSession(name: string = 'New Session', imageId?: string): ChatSession {
  const timestamp = new Date();
  return {
    id: `session-${timestamp.getTime()}`,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [],
    imageId
  };
}

// Create the initial state with a default session
const initialState: ChatState = {
  sessions: [createNewSession('Default Session')],
  activeSessionId: null, // Will be set to the first session in init()
  prompt: '',
  error: ''
};

// Create the store
const { subscribe, set, update } = writable<ChatState>(initialState);

// Initialize the store (called on app start)
function init() {
  update(state => {
    // If there are no sessions, create a default one
    if (state.sessions.length === 0) {
      state.sessions.push(createNewSession('Default Session'));
    }
    
    // Set the active session to the first one if not set
    if (!state.activeSessionId && state.sessions.length > 0) {
      state.activeSessionId = state.sessions[0].id;
    }
    
    return state;
  });
}

// Get the active session
function getActiveSession(state: ChatState): ChatSession | null {
  if (!state.activeSessionId) return null;
  return state.sessions.find(s => s.id === state.activeSessionId) || null;
}

// Find a session by imageId
function findSessionByImageId(state: ChatState, imageId: string): ChatSession | null {
  return state.sessions.find(s => s.imageId === imageId) || null;
}

// Create the chat store with actions
export const chatStore = {
  subscribe,
  init,
  
  // Get current messages (derived from active session)
  get messages(): ChatMessage[] {
    const state = get({ subscribe });
    const activeSession = getActiveSession(state);
    return activeSession?.messages || [];
  },
  
  // Get all sessions
  get sessions(): ChatSession[] {
    return get({ subscribe }).sessions;
  },
  
  // Find a session by imageId and optionally set it as active
  findSessionByImageId: (imageId: string, setAsActive: boolean = true): ChatSession | null => {
    const state = get({ subscribe });
    const session = findSessionByImageId(state, imageId);
    
    // If found and setAsActive is true, set this session as active
    if (session && setAsActive) {
      update(state => ({
        ...state,
        activeSessionId: session.id
      }));
    }
    
    return session;
  },
  
  // Add a message to the active chat session
  addMessage: (message: ChatMessage | string, type?: 'user' | 'assistant' | 'system') => {
    update(state => {
      const activeSession = getActiveSession(state);
      if (!activeSession) return state;
      
      // Handle both object and string message formats
      let newMessage: ChatMessage;
      
      if (typeof message === 'string' && type) {
        // Legacy format: string message + type
        newMessage = {
          type,
          text: message,
          timestamp: new Date()
        };
      } else if (typeof message === 'object') {
        // New format: ChatMessage object
        newMessage = message as ChatMessage;
      } else {
        console.error('Invalid message format');
        return state;
      }
      
      // Update the active session
      const updatedSessions = state.sessions.map(session => {
        if (session.id === state.activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, newMessage],
            updatedAt: new Date()
          };
        }
        return session;
      });
      
      return {
        ...state,
        sessions: updatedSessions
      };
    });
  },
  
  // Update the last message in the active chat session
  updateLastMessage: (message: ChatMessage) => {
    update(state => {
      const activeSession = getActiveSession(state);
      if (!activeSession || activeSession.messages.length === 0) return state;
      
      // Update the active session
      const updatedSessions = state.sessions.map(session => {
        if (session.id === state.activeSessionId) {
          const messages = [...session.messages];
          messages[messages.length - 1] = message;
          
          return {
            ...session,
            messages,
            updatedAt: new Date()
          };
        }
        return session;
      });
      
      return {
        ...state,
        sessions: updatedSessions
      };
    });
  },
  
  // Clear all messages in the active chat session
  clearMessages: () => {
    update(state => {
      const updatedSessions = state.sessions.map(session => {
        if (session.id === state.activeSessionId) {
          return {
            ...session,
            messages: [],
            updatedAt: new Date()
          };
        }
        return session;
      });
      
      return {
        ...state,
        sessions: updatedSessions
      };
    });
  },
  
  // Create a new chat session and set it as active
  createSession: (name: string = 'New Session', imageId?: string) => {
    const newSession = createNewSession(name, imageId);
    
    update(state => ({
      ...state,
      sessions: [...state.sessions, newSession],
      activeSessionId: newSession.id
    }));
    
    return newSession;
  },
  
  // Switch to a different chat session
  setActiveSession: (sessionId: string) => {
    update(state => {
      if (state.sessions.some(s => s.id === sessionId)) {
        return {
          ...state,
          activeSessionId: sessionId
        };
      }
      return state;
    });
  },
  
  // Rename a chat session
  renameSession: (sessionId: string, newName: string) => {
    update(state => {
      const updatedSessions = state.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            name: newName,
            updatedAt: new Date()
          };
        }
        return session;
      });
      
      return {
        ...state,
        sessions: updatedSessions
      };
    });
  },
  
  // Update a session's imageId
  updateSessionImageId: (sessionId: string, imageId: string) => {
    update(state => {
      const updatedSessions = state.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            imageId,
            updatedAt: new Date()
          };
        }
        return session;
      });
      
      return {
        ...state,
        sessions: updatedSessions
      };
    });
  },
  
  // Delete a chat session
  deleteSession: (sessionId: string) => {
    update(state => {
      // Filter out the session to delete
      const updatedSessions = state.sessions.filter(s => s.id !== sessionId);
      
      // If we deleted the active session, switch to another one
      let activeSessionId = state.activeSessionId;
      if (activeSessionId === sessionId && updatedSessions.length > 0) {
        activeSessionId = updatedSessions[0].id;
      } else if (updatedSessions.length === 0) {
        // If no sessions left, create a new default one
        const newSession = createNewSession('Default Session');
        updatedSessions.push(newSession);
        activeSessionId = newSession.id;
      }
      
      return {
        ...state,
        sessions: updatedSessions,
        activeSessionId
      };
    });
  },
  
  // Set the prompt
  setPrompt: (prompt: string) => {
    update(state => ({
      ...state,
      prompt
    }));
  },
  
  // Clear the prompt
  clearPrompt: () => {
    update(state => ({
      ...state,
      prompt: ''
    }));
  },
  
  // Set an error message
  setError: (error: string) => {
    update(state => ({
      ...state,
      error
    }));
  }
};

// Derived store for active session
export const activeSession = derived({ subscribe }, state => getActiveSession(state)); 