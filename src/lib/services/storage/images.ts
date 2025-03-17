/**
 * Image Storage Service
 * 
 * This service provides functions for storing and retrieving images.
 * Currently using local storage for demo purposes.
 */

import { browser } from '$app/environment';
import type { Image } from '$lib/types';

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
  
  const timestamp = new Date();
  const imageId = `img-${timestamp.getTime()}`;
  
  // Create image object
  const newImage: Image = {
    id: imageId,
    userId,
    prompt,
    imageUrl: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
    thumbnail: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
    status: 'completed',
    createdAt: timestamp,
    updatedAt: timestamp,
    metadata: {
      width: 1024,
      height: 1024,
      format: 'jpeg',
      size: base64Image.length
    },
    versions: [
      {
        id: `v-${timestamp.getTime()}`,
        imageId,
        prompt,
        imageUrl: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
        createdAt: timestamp
      }
    ]
  };
  
  // Save to local storage
  saveImageToStorage(newImage);
  
  return newImage;
}

/**
 * Add a new version to an existing image
 * 
 * @param imageId Image ID
 * @param base64Image Base64 encoded image data
 * @param prompt User prompt that generated the image
 * @returns The updated image object or null if image not found
 */
export function addImageVersion(
  imageId: string,
  base64Image: string,
  prompt: string
): Image | null {
  if (!browser) return null;
  
  // Get the image from storage
  const image = getImageFromStorage(imageId);
  if (!image) return null;
  
  const timestamp = new Date();
  
  // Create new version
  const newVersion = {
    id: `v-${timestamp.getTime()}`,
    imageId,
    prompt,
    imageUrl: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
    createdAt: timestamp
  };
  
  // Update image
  const updatedImage: Image = {
    ...image,
    imageUrl: newVersion.imageUrl,
    updatedAt: timestamp,
    versions: [...image.versions, newVersion]
  };
  
  // Save to local storage
  saveImageToStorage(updatedImage);
  
  return updatedImage;
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