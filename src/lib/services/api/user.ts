/**
 * User Service
 * 
 * This service provides functions to manage user settings and API keys.
 * Currently using local storage for demo purposes, but can be extended
 * to use Firebase Auth or other authentication solutions.
 */

import { browser } from '$app/environment';
import type { User } from '$lib/types';
import { writable, get } from 'svelte/store';

// Define a prefix for local storage keys
const STORAGE_PREFIX = 'vide_edit_';

// Create a user store
export const userStore = writable<User | null>(null);

// Initialize the user store from local storage
if (browser) {
  const userJson = localStorage.getItem(`${STORAGE_PREFIX}user`);
  if (userJson) {
    try {
      const userData = JSON.parse(userJson);
      userStore.set({
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      });
    } catch (error) {
      console.error('Error parsing user data from local storage:', error);
    }
  }
}

/**
 * Create a new user
 * 
 * @param email User email
 * @param name User name
 * @returns The created user object
 */
export function createUser(email: string, name: string): User {
  if (!browser) throw new Error('Cannot create user in server context');
  
  const timestamp = new Date();
  const [firstName, ...lastNameParts] = name.split(' ');
  const lastName = lastNameParts.join(' ');
  
  const newUser: User = {
    id: `user-${timestamp.getTime()}`,
    email,
    name,
    firstName,
    lastName,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Save to local storage
  localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(newUser));
  
  // Update the store
  userStore.set(newUser);
  
  return newUser;
}

/**
 * Update user API key
 * 
 * @param apiKey Gemini API key
 * @returns The updated user object
 */
export function updateUserApiKey(apiKey: string): User | null {
  if (!browser) return null;
  
  // Get current user using get helper
  const user = get(userStore);
  
  if (!user) return null;
  
  // Update user
  const updatedUser: User = {
    ...user,
    updatedAt: new Date(),
    apiKey
  };
  
  // Save to local storage
  localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(updatedUser));
  
  // Update the store
  userStore.set(updatedUser);
  
  return updatedUser;
}

/**
 * Get current user
 * 
 * @returns The current user object or null if not logged in
 */
export function getCurrentUser(): User | null {
  return get(userStore);
}

/**
 * Create a demo user if none exists
 * 
 * @returns The demo user object
 */
export function createDemoUserIfNeeded(): User {
  const currentUser = getCurrentUser();
  if (currentUser) return currentUser;
  
  return createUser('demo@example.com', 'Demo User');
}

/**
 * Log out the current user
 */
export function logoutUser(): void {
  if (!browser) return;
  
  // Clear user from local storage
  localStorage.removeItem(`${STORAGE_PREFIX}user`);
  
  // Clear the store
  userStore.set(null);
}

const API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * Get the user's API key from local storage
 * 
 * @returns Promise that resolves to the API key or null if not found
 */
export async function getUserApiKey(): Promise<string | null> {
  if (!browser) return null;
  
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

/**
 * Save the user's API key to local storage
 * 
 * @param apiKey The API key to save
 * @returns Promise that resolves when the API key is saved
 */
export async function saveUserApiKey(apiKey: string): Promise<void> {
  if (!browser) return;
  
  try {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving API key:', error);
    throw new Error('Failed to save API key');
  }
}

/**
 * Check if the user has an API key
 * 
 * @returns Promise that resolves to true if the user has an API key
 */
export async function hasApiKey(): Promise<boolean> {
  const apiKey = await getUserApiKey();
  return !!apiKey;
}

/**
 * Clear the user's API key from local storage
 * 
 * @returns Promise that resolves when the API key is cleared
 */
export async function clearApiKey(): Promise<void> {
  if (!browser) return;
  
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing API key:', error);
    throw new Error('Failed to clear API key');
  }
} 