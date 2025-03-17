// UI store for managing UI state
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define theme type
export type Theme = 'light' | 'dark' | 'system';

// Define UI state interface
interface UIState {
  activeTab: string;
  isLoading: boolean;
  loadingProgress: number;
  loadingText: string;
  theme: Theme;
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
  theme: getInitialTheme()
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
  
  // Simulate loading progress
  simulateLoading: () => {
    if (!browser) return;
    
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