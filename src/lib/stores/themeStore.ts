import { writable, derived } from 'svelte/store';

// Create a store for the selected theme
export const psTheme = writable('CC 2024');

// Theme configurations for different Photoshop versions
interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  border: string;
  panel: string;
  panelBg?: string;
  button: string;
  buttonBg?: string;
  buttonHover: string;
  inputBg?: string;
  fontFamily: string;
  borderRadius: string;
  shadow: string;
}

type ThemeConfigs = {
  [key: string]: ThemeConfig;
};

const themeConfigs: ThemeConfigs = {
  'CC 2024': {
    primary: '#2D2D2D',
    secondary: '#1E1E1E',
    accent: '#0078D7',
    text: '#E0E0E0',
    border: '#3A3A3A',
    panel: '#252525',
    panelBg: '#252525',
    button: '#363636',
    buttonBg: '#363636',
    buttonHover: '#404040',
    inputBg: '#1E1E1E',
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: '4px',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  'CC 2022': {
    primary: '#2A2A2A',
    secondary: '#1C1C1C',
    accent: '#1473E6',
    text: '#E6E6E6',
    border: '#383838',
    panel: '#232323',
    panelBg: '#232323',
    button: '#333333',
    buttonBg: '#333333',
    buttonHover: '#3D3D3D',
    inputBg: '#1C1C1C',
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: '4px',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  'CC 2020': {
    primary: '#323232',
    secondary: '#212121',
    accent: '#1473E6',
    text: '#E6E6E6',
    border: '#3F3F3F',
    panel: '#262626',
    panelBg: '#262626',
    button: '#383838',
    buttonBg: '#383838',
    buttonHover: '#424242',
    inputBg: '#212121',
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: '4px',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  'CS6': {
    primary: '#333333',
    secondary: '#222222',
    accent: '#2D91E8',
    text: '#CCCCCC',
    border: '#444444',
    panel: '#282828',
    panelBg: '#282828',
    button: '#3A3A3A',
    buttonBg: '#3A3A3A',
    buttonHover: '#454545',
    inputBg: '#222222',
    fontFamily: "'Lucida Grande', 'Segoe UI', sans-serif",
    borderRadius: '3px',
    shadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },
  'CS3': {
    primary: '#4B4B4B',
    secondary: '#333333',
    accent: '#3F92D2',
    text: '#DDDDDD',
    border: '#555555',
    panel: '#3D3D3D',
    panelBg: '#3D3D3D',
    button: '#4F4F4F',
    buttonBg: '#4F4F4F',
    buttonHover: '#5A5A5A',
    inputBg: '#333333',
    fontFamily: "'Lucida Grande', 'Tahoma', sans-serif",
    borderRadius: '2px',
    shadow: '0 2px 3px rgba(0, 0, 0, 0.3)'
  },
  '7.0': {
    primary: '#6A6A6A',
    secondary: '#535353',
    accent: '#0066CC',
    text: '#EEEEEE',
    border: '#777777',
    panel: '#5A5A5A',
    panelBg: '#5A5A5A',
    button: '#6E6E6E',
    buttonBg: '#6E6E6E',
    buttonHover: '#7A7A7A',
    inputBg: '#535353',
    fontFamily: "'Tahoma', 'Arial', sans-serif",
    borderRadius: '0px',
    shadow: '2px 2px 0 rgba(0, 0, 0, 0.4)'
  }
};

// Derived store that provides the current theme configuration
export const currentTheme = derived(psTheme, $psTheme => themeConfigs[$psTheme]);

// Photoshop versions for the theme switcher
export const psVersions = [
  { value: 'CC 2024', label: 'Photoshop CC 2024 (v25)' },
  { value: 'CC 2022', label: 'Photoshop CC 2022 (v23)' },
  { value: 'CC 2020', label: 'Photoshop CC 2020 (v21)' },
  { value: 'CS6', label: 'Photoshop CS6 (v13)' },
  { value: 'CS3', label: 'Photoshop CS3 (v10)' },
  { value: '7.0', label: 'Photoshop 7.0 (Classic)' }
]; 