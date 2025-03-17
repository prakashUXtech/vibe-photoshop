/**
 * Toast Notification Store
 * 
 * This store manages toast notifications for the application.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function addToast(message: string, type: ToastType = 'info', duration: number = 3000): string {
    if (!browser) return '';
    
    const id = crypto.randomUUID();
    
    update(toasts => [
      ...toasts,
      { id, message, type, duration }
    ]);
    
    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  }
  
  function removeToast(id: string) {
    if (!browser) return;
    
    update(toasts => toasts.filter(toast => toast.id !== id));
  }
  
  function clearToasts() {
    if (!browser) return;
    
    update(() => []);
  }
  
  // Helper methods for different toast types
  function success(message: string, duration: number = 3000) {
    return addToast(message, 'success', duration);
  }
  
  function error(message: string, duration: number = 4000) {
    return addToast(message, 'error', duration);
  }
  
  function info(message: string, duration: number = 3000) {
    return addToast(message, 'info', duration);
  }
  
  function warning(message: string, duration: number = 3500) {
    return addToast(message, 'warning', duration);
  }

  return {
    subscribe,
    add: addToast,
    remove: removeToast,
    clear: clearToasts,
    success,
    error,
    info,
    warning
  };
}

export const toast = createToastStore(); 