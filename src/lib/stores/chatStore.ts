// Chat store for managing messages and prompt state
import { writable } from 'svelte/store';

// Define message interface
export interface ChatMessage {
  type: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  images?: string[];  // Add support for image arrays
}

// Define chat state interface
interface ChatState {
  messages: ChatMessage[];
  prompt: string;
  error: string;
}

// Create initial state
const initialState: ChatState = {
  messages: [{
    type: 'system',
    text: 'Welcome to Vibe Photoshop! Upload an image or enter a prompt to get started.',
    timestamp: new Date()
  }],
  prompt: '',
  error: ''
};

// Create the store
const { subscribe, set, update } = writable<ChatState>(initialState);

// Create the chat store with actions
export const chatStore = {
  subscribe,
  
  // Add a message
  addMessage: (message: ChatMessage) => {
    update(state => ({
      messages: [...state.messages, message]
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
        type: 'system',
        text: 'Welcome to Vibe Photoshop! Upload an image or enter a prompt to get started.',
        timestamp: new Date()
      }]
    }));
  },
  
  // Clear all messages
  clearMessages: () => {
    update(() => ({
      messages: []
    }));
  }
}; 