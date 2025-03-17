/**
 * Storage Manager Utility
 * 
 * This utility provides functions for managing localStorage quota and cleanup.
 * It includes functionality for:
 * - Checking available storage space
 * - Compressing image data
 * - Cleaning up old versions when quota is exceeded
 */

import { browser } from '$app/environment';
import type { Image } from '$lib/types';

const STORAGE_PREFIX = 'vibe_photoshop_';
const MAX_STORAGE_VERSIONS = 5; // Maximum number of versions to keep per image
const ESTIMATED_QUOTA = 5 * 1024 * 1024; // Estimate 5MB quota (conservative)

/**
 * Check if there's enough space in localStorage
 * @param newDataSize Size of new data to store in bytes
 * @returns boolean indicating if there's enough space
 */
export function hasEnoughStorage(newDataSize: number): boolean {
  if (!browser) return false;
  
  try {
    // Calculate current usage
    let currentUsage = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        currentUsage += localStorage.getItem(key)?.length || 0;
      }
    }
    
    // Check if adding new data would exceed quota
    return (currentUsage + newDataSize) < ESTIMATED_QUOTA;
  } catch (error) {
    console.error('Error checking storage space:', error);
    return false;
  }
}

/**
 * Compress an image by reducing its quality
 * @param base64Image Base64 image data
 * @returns Promise<string> Compressed base64 image data
 */
export function compressImage(base64Image: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get compressed data URL (0.7 quality)
      const compressedData = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedData.split(',')[1]); // Remove data URL prefix
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
  });
}

/**
 * Clean up old versions of images to free up space
 * @param excludeImageId Optional ID of image to exclude from cleanup
 * @returns Promise<void>
 */
export async function cleanupOldVersions(excludeImageId?: string): Promise<void> {
  if (!browser) return;
  
  try {
    const images: Image[] = [];
    
    // Collect all images
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}image_`)) {
        try {
          const imageJson = localStorage.getItem(key);
          if (imageJson) {
            const imageData = JSON.parse(imageJson);
            if (imageData.id !== excludeImageId) {
              images.push(imageData);
            }
          }
        } catch (error) {
          console.error('Error parsing image data:', error);
        }
      }
    }
    
    // Sort images by last updated time
    images.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    // Keep only recent versions for each image
    for (const image of images) {
      if (image.versions.length > MAX_STORAGE_VERSIONS) {
        // Keep only the most recent versions
        image.versions = image.versions.slice(-MAX_STORAGE_VERSIONS);
        
        // Update the image in storage
        try {
          localStorage.setItem(
            `${STORAGE_PREFIX}image_${image.id}`,
            JSON.stringify(image)
          );
        } catch (error) {
          console.error('Error updating image after version cleanup:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

/**
 * Get estimated size of data in bytes
 * @param data String data to measure
 * @returns number Size in bytes
 */
export function getDataSize(data: string): number {
  return new Blob([data]).size;
} 