// Chat store for managing messages and prompt state
import { writable } from 'svelte/store';

// Define message interface
export interface ChatMessage {
  text: string;
  type: 'user' | 'system';
  timestamp: Date;
}

// Define chat state interface
interface ChatState {
  messages: ChatMessage[];
  prompt: string;
  error: string;
}

// Create initial state
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
  
  // Add a message
  addMessage: (text: string, type: 'user' | 'system') => {
    update(state => ({
      ...state,
      messages: [...state.messages, {
        text,
        type,
        timestamp: new Date()
      }]
    }));
  },
  
  // Set the prompt
  setPrompt: (prompt: string) => {
    update(state => ({
      ...state,
      prompt
    }));
  },
  
  // Set error message
  setError: (error: string) => {
    update(state => ({
      ...state,
      error
    }));
  },
  
  // Clear the prompt
  clearPrompt: () => {
    update(state => ({
      ...state,
      prompt: ''
    }));
  },
  
  // Reset chat (keep welcome message)
  resetChat: () => {
    update(state => ({
      ...initialState,
      messages: [{
        text: 'Welcome to Vibe Photoshop! Upload an image or enter a prompt to get started.',
        type: 'system',
        timestamp: new Date()
      }]
    }));
  }
}; 