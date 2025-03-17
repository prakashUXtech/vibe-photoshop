// UI store for managing UI state
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define theme type
export type Theme = 'light' | 'dark' | 'system';

// Define UI state interface
export interface UIState {
  activeTab: string;
  isLoading: boolean;
  loadingProgress: number;
  loadingText: string;
  theme: Theme;
  selectedImage: string | null;
  selectedModel: string;
  isStreaming: boolean;
  showImageBorder: boolean;
}

// Get initial theme from localStorage or default to system
function getInitialTheme(): Theme {
  if (browser) {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  }
  return 'system';
}

// Apply theme to document
function applyTheme(theme: Theme) {
  if (!browser) return;
  
  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Create initial state
const initialState: UIState = {
  activeTab: 'vibe', // 'vibe', 'history', 'adjustments', 'settings'
  isLoading: true,
  loadingProgress: 0,
  loadingText: 'Initializing...',
  theme: getInitialTheme(),
  selectedImage: null,
  selectedModel: 'gemini-pro-vision',
  isStreaming: false,
  showImageBorder: true // Default to showing border
};

// Create the store
const { subscribe, set, update } = writable<UIState>(initialState);

// Initialize theme on client-side only
if (browser) {
  // Apply initial theme
  applyTheme(initialState.theme);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    update(state => {
      if (state.theme === 'system') {
        applyTheme('system');
      }
      return state;
    });
  };
  
  mediaQuery.addEventListener('change', handleChange);
}

// Create the UI store with actions
export const uiStore = {
  subscribe,
  
  // Toggle image border
  toggleImageBorder: () => {
    update(state => ({
      ...state,
      showImageBorder: !state.showImageBorder
    }));
  },
  
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
  
  // Set theme
  setTheme: (theme: Theme) => {
    if (browser) {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }
    
    update(state => ({
      ...state,
      theme
    }));
  },
  
  // Set selected image
  setSelectedImage: (image: string | null) => {
    update(state => ({
      ...state,
      selectedImage: image
    }));
  },
  
  // Set selected model
  setSelectedModel: (model: string) => {
    update(state => ({
      ...state,
      selectedModel: model
    }));
  },
  
  // Set streaming state
  setStreaming: (isStreaming: boolean) => {
    update(state => ({
      ...state,
      isStreaming: isStreaming
    }));
  },
  
  // Simulate loading progress
  simulateLoading: () => {
    if (!browser) return;
    
    update(state => ({
      ...state,
      isLoading: true,
      loadingProgress: 0,
      loadingText: 'Starting...'
    }));
    
    const interval = setInterval(() => {
      update(state => {
        if (state.loadingProgress >= 100) {
          clearInterval(interval);
          return {
            ...state,
            isLoading: false,
            loadingProgress: 0,
            loadingText: ''
          };
        }
        
        const progress = Math.min(state.loadingProgress + 10, 100);
        return {
          ...state,
          loadingProgress: progress,
          loadingText: progress < 100 ? 'Almost ready...' : 'Done!'
        };
      });
    }, 100);
  }
}; 