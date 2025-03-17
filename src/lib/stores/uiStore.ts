// UI store for managing UI state
import { writable } from 'svelte/store';

// Define UI state interface
interface UIState {
  activeTab: string;
  isLoading: boolean;
  loadingProgress: number;
  loadingText: string;
}

// Create initial state
const initialState: UIState = {
  activeTab: 'vibe', // 'vibe', 'history', 'adjustments'
  isLoading: true,
  loadingProgress: 0,
  loadingText: 'Initializing...'
};

// Create the store
const { subscribe, set, update } = writable<UIState>(initialState);

// Create the UI store with actions
export const uiStore = {
  subscribe,
  
  // Set active tab
  setActiveTab: (tab: string) => {
    update(state => ({
      ...state,
      activeTab: tab
    }));
  },
  
  // Set loading state
  setLoading: (isLoading: boolean) => {
    update(state => ({
      ...state,
      isLoading
    }));
  },
  
  // Set loading progress
  setLoadingProgress: (progress: number) => {
    update(state => ({
      ...state,
      loadingProgress: progress
    }));
  },
  
  // Set loading text
  setLoadingText: (text: string) => {
    update(state => ({
      ...state,
      loadingText: text
    }));
  },
  
  // Simulate loading progress
  simulateLoading: () => {
    update(state => ({
      ...state,
      isLoading: true,
      loadingProgress: 0,
      loadingText: 'Initializing...'
    }));
    
    const interval = setInterval(() => {
      update(state => {
        if (state.loadingProgress < 100) {
          const newProgress = state.loadingProgress + 10;
          
          let newText = state.loadingText;
          if (newProgress < 30) {
            newText = 'Initializing application...';
          } else if (newProgress < 60) {
            newText = 'Loading resources...';
          } else if (newProgress < 90) {
            newText = 'Preparing workspace...';
          } else {
            newText = 'Almost ready...';
          }
          
          return {
            ...state,
            loadingProgress: newProgress,
            loadingText: newText
          };
        } else {
          clearInterval(interval);
          
          // Set a timeout to hide the loading screen
          setTimeout(() => {
            update(s => ({
              ...s,
              isLoading: false
            }));
          }, 300);
          
          return state;
        }
      });
    }, 50);
  }
}; 