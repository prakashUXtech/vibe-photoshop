/**
 * IndexedDB Storage Service
 * 
 * This service provides functions for storing and retrieving images using IndexedDB.
 * Features:
 * - Efficient image storage with compression
 * - Version history management
 * - Automatic cleanup of old versions
 */

import { browser } from '$app/environment';
import type { Image } from '$lib/types';

const DB_NAME = 'vide_edit_db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

interface DBImage extends Omit<Image, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

/**
 * Initialize the IndexedDB database
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!browser) {
      reject(new Error('Cannot initialize IndexedDB in server context'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the images store with an index on userId
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

/**
 * Compress an image with better quality control
 */
async function compressImage(base64Image: string, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate target dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      const MAX_DIMENSION = 1024;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = (height / width) * MAX_DIMENSION;
          width = MAX_DIMENSION;
        } else {
          width = (width / height) * MAX_DIMENSION;
          height = MAX_DIMENSION;
        }
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw image with resize
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get compressed data URL
      const compressedData = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedData.split(',')[1]);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
  });
}

/**
 * Save an image to IndexedDB
 */
export async function saveImage(image: Image): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Convert dates to strings for storage
    const dbImage: DBImage = {
      ...image,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
      versions: image.versions.map(v => ({
        ...v,
        createdAt: v.createdAt.toISOString()
      }))
    };
    
    const request = store.put(dbImage);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get an image from IndexedDB
 */
export async function getImage(imageId: string): Promise<Image | null> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(imageId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (!request.result) {
        resolve(null);
        return;
      }
      
      // Convert stored strings back to dates
      const dbImage = request.result as DBImage;
      resolve({
        ...dbImage,
        createdAt: new Date(dbImage.createdAt),
        updatedAt: new Date(dbImage.updatedAt),
        versions: dbImage.versions.map(v => ({
          ...v,
          createdAt: new Date(v.createdAt)
        }))
      });
    };
  });
}

/**
 * Get all images for a user
 */
export async function getUserImages(userId: string): Promise<Image[]> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userId');
    const request = index.getAll(userId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Convert stored strings back to dates for all images
      const images = request.result.map((dbImage: DBImage) => ({
        ...dbImage,
        createdAt: new Date(dbImage.createdAt),
        updatedAt: new Date(dbImage.updatedAt),
        versions: dbImage.versions.map(v => ({
          ...v,
          createdAt: new Date(v.createdAt)
        }))
      }));
      
      // Sort by updatedAt descending
      images.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      resolve(images);
    };
  });
}

/**
 * Delete an image from IndexedDB
 */
export async function deleteImage(imageId: string): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(imageId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Add a new version to an image
 */
export async function addImageVersion(
  imageId: string,
  base64Image: string,
  prompt: string,
  responseText?: string
): Promise<Image | null> {
  // Get existing image
  const image = await getImage(imageId);
  if (!image) return null;
  
  // Compress the new version
  const compressedImage = await compressImage(base64Image);
  
  const timestamp = new Date();
  
  // Create new version
  const newVersion = {
    id: `v-${timestamp.getTime()}`,
    imageId,
    prompt,
    responseText,
    imageUrl: `data:image/jpeg;base64,${compressedImage}`,
    createdAt: timestamp
  };
  
  // Update image
  const updatedImage: Image = {
    ...image,
    imageUrl: newVersion.imageUrl,
    updatedAt: timestamp,
    versions: [...image.versions, newVersion]
  };
  
  // Save updated image
  await saveImage(updatedImage);
  
  return updatedImage;
}

/**
 * Clean up old versions of images
 */
export async function cleanupOldVersions(maxVersions = 5): Promise<void> {
  const db = await initDB();
  
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.openCursor();
  
  request.onerror = () => console.error('Error cleaning up versions:', request.error);
  
  request.onsuccess = async () => {
    const cursor = request.result;
    if (!cursor) return;
    
    const image = cursor.value as DBImage;
    if (image.versions.length > maxVersions) {
      // Keep only the most recent versions
      image.versions = image.versions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, maxVersions);
      
      try {
        await saveImage({
          ...image,
          createdAt: new Date(image.createdAt),
          updatedAt: new Date(image.updatedAt),
          versions: image.versions.map(v => ({
            ...v,
            createdAt: new Date(v.createdAt)
          }))
        });
      } catch (error) {
        console.error('Error saving cleaned up image:', error);
      }
    }
    
    cursor.continue();
  };
} 