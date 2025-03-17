/**
 * Image Storage Service
 * 
 * This service provides functions for storing and retrieving images.
 * Updated to include storage quota management and image compression.
 */

import { browser } from '$app/environment';
import type { Image } from '$lib/types';
import { hasEnoughStorage, compressImage, cleanupOldVersions, getDataSize } from './storageManager';

// Storage prefix for local storage
const STORAGE_PREFIX = 'vibe_photoshop_';

/**
 * Save a generated image
 * 
 * @param userId User ID
 * @param base64Image Base64 encoded image data
 * @param prompt User prompt that generated the image
 * @param responseText Optional response text from the API
 * @returns The saved image object
 */
export async function saveGeneratedImage(
  userId: string,
  base64Image: string,
  prompt: string,
  responseText?: string
): Promise<Image> {
  if (!browser) throw new Error('Cannot save image in server context');
  
  try {
    // Compress the image before saving
    const compressedImage = await compressImage(base64Image);
    
    const timestamp = new Date();
    const imageId = `img-${timestamp.getTime()}`;
    
    // Create image object
    const newImage: Image = {
      id: imageId,
      userId,
      prompt,
      imageUrl: `data:image/jpeg;base64,${compressedImage}`,
      thumbnail: `data:image/jpeg;base64,${compressedImage}`,
      status: 'completed',
      createdAt: timestamp,
      updatedAt: timestamp,
      metadata: {
        width: 1024,
        height: 1024,
        format: 'jpeg',
        size: getDataSize(compressedImage)
      },
      versions: [
        {
          id: `v-${timestamp.getTime()}`,
          imageId,
          prompt,
          imageUrl: `data:image/jpeg;base64,${compressedImage}`,
          createdAt: timestamp
        }
      ]
    };
    
    // Check if we have enough storage space
    const imageJson = JSON.stringify(newImage);
    const dataSize = getDataSize(imageJson);
    
    if (!hasEnoughStorage(dataSize)) {
      // Try to clean up old versions first
      await cleanupOldVersions(imageId);
      
      // Check again after cleanup
      if (!hasEnoughStorage(dataSize)) {
        throw new Error('Storage quota exceeded. Please delete some images to free up space.');
      }
    }
    
    // Save to local storage
    try {
      localStorage.setItem(`${STORAGE_PREFIX}image_${imageId}`, imageJson);
    } catch (error) {
      console.error('Error saving image to local storage:', error);
      throw new Error('Failed to save image. Storage quota may be exceeded.');
    }
    
    return newImage;
  } catch (error) {
    console.error('Error in saveGeneratedImage:', error);
    throw error;
  }
}

/**
 * Add a new version to an existing image
 * 
 * @param imageId Image ID
 * @param base64Image Base64 encoded image data
 * @param prompt User prompt that generated the image
 * @param responseText Optional response text from the API
 * @returns Promise that resolves to the new version object
 */
export async function addImageVersion(
  imageId: string,
  base64Image: string,
  prompt: string,
  responseText?: string
): Promise<Image | null> {
  if (!browser) {
    console.error('❌ STORAGE: Cannot add version in server context');
    return null;
  }
  
  try {
    console.log('📦 STORAGE: Getting image from storage:', imageId);
    // Get the image from storage
    const image = getImageFromStorage(imageId);
    if (!image) {
      console.error('❌ STORAGE: Image not found in storage:', imageId);
      return null;
    }
    
    console.log('🗜️ STORAGE: Compressing new version image');
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
    
    console.log('📝 STORAGE: Creating new version:', {
      versionId: newVersion.id,
      imageId: newVersion.imageId,
      hasResponseText: !!responseText
    });
    
    // Update image
    const updatedImage: Image = {
      ...image,
      imageUrl: newVersion.imageUrl,
      updatedAt: timestamp,
      versions: [...image.versions, newVersion]
    };
    
    // Check storage space
    const imageJson = JSON.stringify(updatedImage);
    const dataSize = getDataSize(imageJson);
    
    console.log('💾 STORAGE: Checking storage space for new version:', {
      size: dataSize,
      versionsCount: updatedImage.versions.length
    });
    
    if (!hasEnoughStorage(dataSize)) {
      console.log('⚠️ STORAGE: Storage quota exceeded, attempting cleanup');
      // Try to clean up old versions first
      await cleanupOldVersions(imageId);
      
      // Check again after cleanup
      if (!hasEnoughStorage(dataSize)) {
        console.error('❌ STORAGE: Storage quota still exceeded after cleanup');
        throw new Error('Storage quota exceeded. Please delete some images to free up space.');
      }
      console.log('✅ STORAGE: Cleanup successful, proceeding with save');
    }
    
    // Save to local storage
    try {
      console.log('💾 STORAGE: Saving updated image to storage');
      localStorage.setItem(`${STORAGE_PREFIX}image_${imageId}`, imageJson);
      console.log('✅ STORAGE: Image saved successfully');
      return updatedImage;
    } catch (error) {
      console.error('❌ STORAGE: Error saving image version to local storage:', error);
      throw new Error('Failed to save image version. Storage quota may be exceeded.');
    }
  } catch (error) {
    console.error('❌ STORAGE: Error in addImageVersion:', error);
    throw error;
  }
}

/**
 * Get all images for a user
 * 
 * @param userId User ID
 * @returns Array of images
 */
export function getUserImages(userId: string): Image[] {
  if (!browser) return [];
  
  const images: Image[] = [];
  
  // Iterate through local storage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${STORAGE_PREFIX}image_`)) {
      try {
        const imageJson = localStorage.getItem(key);
        if (imageJson) {
          const imageData = JSON.parse(imageJson);
          if (imageData.userId === userId) {
            // Convert date strings to Date objects
            const image: Image = {
              ...imageData,
              createdAt: new Date(imageData.createdAt),
              updatedAt: new Date(imageData.updatedAt),
              versions: imageData.versions.map((v: any) => ({
                ...v,
                createdAt: new Date(v.createdAt)
              }))
            };
            images.push(image);
          }
        }
      } catch (error) {
        console.error('Error parsing image data from local storage:', error);
      }
    }
  }
  
  // Sort by creation date (newest first)
  return images.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get an image by ID
 * 
 * @param imageId Image ID
 * @returns The image object or null if not found
 */
export function getImage(imageId: string): Image | null {
  return getImageFromStorage(imageId);
}

/**
 * Delete an image
 * 
 * @param imageId Image ID
 * @returns True if the image was deleted
 */
export function deleteImage(imageId: string): boolean {
  if (!browser) return false;
  
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}image_${imageId}`);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Helper functions

/**
 * Save an image to local storage
 */
function saveImageToStorage(image: Image): void {
  if (!browser) return;
  
  try {
    localStorage.setItem(`${STORAGE_PREFIX}image_${image.id}`, JSON.stringify(image));
  } catch (error) {
    console.error('Error saving image to local storage:', error);
  }
}

/**
 * Get an image from local storage
 */
function getImageFromStorage(imageId: string): Image | null {
  if (!browser) return null;
  
  try {
    const imageJson = localStorage.getItem(`${STORAGE_PREFIX}image_${imageId}`);
    if (!imageJson) return null;
    
    const imageData = JSON.parse(imageJson);
    
    // Convert date strings to Date objects
    return {
      ...imageData,
      createdAt: new Date(imageData.createdAt),
      updatedAt: new Date(imageData.updatedAt),
      versions: imageData.versions.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }))
    };
  } catch (error) {
    console.error('Error getting image from local storage:', error);
    return null;
  }
} 