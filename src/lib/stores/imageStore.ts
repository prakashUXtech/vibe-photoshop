// Image store for managing the current image and related state
import { writable } from 'svelte/store';
import type { Image, ImageVersion } from '$lib/types';

// Define the image state interface
interface ImageState {
  currentImage: Image | null;
  isGenerating: boolean;
  isUploading: boolean;
  selectedImage: File | null;
  previewUrl: string | null;
  showVersionHistory: boolean;
}

// Create the initial state
const initialState: ImageState = {
  currentImage: null,
  isGenerating: false,
  isUploading: false,
  selectedImage: null,
  previewUrl: null,
  showVersionHistory: true
};

// Create the store
const { subscribe, set, update } = writable<ImageState>(initialState);

// Create the image store with actions
export const imageStore = {
  subscribe,
  
  // Reset the session
  resetSession: () => {
    update(state => ({
      ...initialState,
      showVersionHistory: state.showVersionHistory // Preserve this setting
    }));
  },
  
  // Toggle version history visibility
  toggleVersionHistory: () => {
    update(state => ({
      ...state,
      showVersionHistory: !state.showVersionHistory
    }));
  },
  
  // Select a specific version
  selectVersion: (version: ImageVersion) => {
    update(state => {
      if (!state.currentImage) return state;
      
      return {
        ...state,
        currentImage: {
          ...state.currentImage,
          imageUrl: version.imageUrl,
          prompt: version.prompt
        }
      };
    });
  },
  
  // Set the current image
  setCurrentImage: (image: Image) => {
    update(state => ({
      ...state,
      currentImage: image
    }));
  },
  
  // Set generating state
  setGenerating: (isGenerating: boolean) => {
    update(state => ({
      ...state,
      isGenerating
    }));
  },
  
  // Set uploading state
  setUploading: (isUploading: boolean) => {
    update(state => ({
      ...state,
      isUploading
    }));
  },
  
  // Set selected image and preview URL
  setSelectedImage: (file: File | null) => {
    update(state => {
      // Clear previous preview URL if it exists
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }
      
      // Create new preview URL if file exists
      const previewUrl = file ? URL.createObjectURL(file) : null;
      
      return {
        ...state,
        selectedImage: file,
        previewUrl
      };
    });
  },
  
  // Add a new version to the current image
  addVersion: (version: ImageVersion) => {
    update(state => {
      if (!state.currentImage) return state;
      
      return {
        ...state,
        currentImage: {
          ...state.currentImage,
          prompt: version.prompt,
          imageUrl: version.imageUrl,
          updatedAt: new Date(),
          versions: [...state.currentImage.versions, version]
        }
      };
    });
  }
}; 