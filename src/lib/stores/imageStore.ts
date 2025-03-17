/**
 * Image Store
 * 
 * Manages the current image and related state in memory.
 * Simplified to avoid local storage dependencies.
 */

import { writable, derived, get } from 'svelte/store';
import type { Image, ImageVersion } from '$lib/types';

// Define the image state interface
interface ImageState {
  currentImage: Image | null;
  imageHistory: Image[];
  isGenerating: boolean;
  isUploading: boolean;
  selectedImage: File | null;
  previewUrl: string | null;
  showVersionHistory: boolean;
}

// Create the initial state
const initialState: ImageState = {
  currentImage: null,
  imageHistory: [],
  isGenerating: false,
  isUploading: false,
  selectedImage: null,
  previewUrl: null,
  showVersionHistory: false
};

// Create the writable store
const imageState = writable<ImageState>(initialState);

// Create the image store with actions
export const imageStore = {
  // Subscribe to the store
  subscribe: imageState.subscribe,
  
  // Set the current image
  setCurrentImage: (image: Image) => {
    imageState.update(state => {
      // Add current image to history if it exists and is different
      const history = [...state.imageHistory];
      if (state.currentImage && state.currentImage.id !== image.id) {
        // Keep only the last 5 images in history
        if (history.length >= 5) {
          history.shift(); // Remove oldest
        }
        history.push(state.currentImage);
      }
      
      return {
        ...state,
        currentImage: image,
        imageHistory: history
      };
    });
  },
  
  // Select an existing version
  selectVersion: (version: ImageVersion) => {
    imageState.update(state => {
      if (!state.currentImage) return state;
      
      return {
        ...state,
        currentImage: {
          ...state.currentImage,
          imageUrl: version.imageUrl,
          updatedAt: new Date()
        }
      };
    });
  },
  
  // Add a new version to the current image
  addVersion: (version: ImageVersion) => {
    imageState.update(state => {
      if (!state.currentImage) return state;
      
      const updatedImage = {
        ...state.currentImage,
        imageUrl: version.imageUrl,
        updatedAt: new Date(),
        versions: [...state.currentImage.versions, version]
      };
      
      return {
        ...state,
        currentImage: updatedImage
      };
    });
  },
  
  // Set generating state
  setGenerating: (isGenerating: boolean) => {
    imageState.update(state => ({
      ...state,
      isGenerating
    }));
  },
  
  // Set uploading state
  setUploading: (isUploading: boolean) => {
    imageState.update(state => ({
      ...state,
      isUploading
    }));
  },
  
  // Set selected image
  setSelectedImage: (file: File | null, previewUrl: string | null = null) => {
    imageState.update(state => ({
      ...state,
      selectedImage: file,
      previewUrl
    }));
  },
  
  // Toggle version history visibility
  toggleVersionHistory: () => {
    imageState.update(state => ({
      ...state,
      showVersionHistory: !state.showVersionHistory
    }));
  },
  
  // Go back to a previous image in history
  goBack: () => {
    imageState.update(state => {
      if (state.imageHistory.length === 0) return state;
      
      const history = [...state.imageHistory];
      const previousImage = history.pop();
      
      return {
        ...state,
        currentImage: previousImage || null,
        imageHistory: history
      };
    });
  },
  
  // Clear all state
  reset: () => {
    imageState.set(initialState);
  }
};

// Derived store for versions of the current image
export const imageVersions = derived(imageState, $state => 
  $state.currentImage?.versions || []
);

// Derived store for whether there's a previous image to go back to
export const canGoBack = derived(imageState, $state => 
  $state.imageHistory.length > 0
); 