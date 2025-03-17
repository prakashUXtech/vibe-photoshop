// Chat store for managing chat messages and state
import { writable } from 'svelte/store';

// Define chat message type
export interface ChatMessage {
  type: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  images?: string[];
}

// Define chat state interface
interface ChatState {
  messages: ChatMessage[];
  prompt: string;
  error: string;
}

// Create the initial state
const initialState: ChatState = {
  messages: [],
  prompt: '',
  error: ''
};

// Create the store
const { subscribe, set, update } = writable<ChatState>(initialState);

// Create the chat store with actions
export const chatStore = {
  subscribe,
  
  // Add a message to the chat
  addMessage: (message: ChatMessage | string, type?: 'user' | 'assistant' | 'system') => {
    update(state => {
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
      
      return {
        ...state,
        messages: [...state.messages, newMessage]
      };
    });
  },
  
  // Update the last message in the chat
  updateLastMessage: (message: ChatMessage) => {
    update(state => {
      if (state.messages.length === 0) return state;
      
      const messages = [...state.messages];
      messages[messages.length - 1] = message;
      
      return {
        ...state,
        messages
      };
    });
  },
  
  // Clear all messages
  clearMessages: () => {
    update(state => ({
      ...state,
      messages: []
    }));
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