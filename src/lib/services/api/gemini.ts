/**
 * Gemini API Service
 * 
 * This service provides functions to interact with Google's Gemini API
 * for image generation and editing using the official @google/generative-ai package.
 */

import { browser } from '$app/environment';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage } from '$lib/stores/chatStore';
import { uiStore } from '$lib/stores/uiStore';
import { get } from 'svelte/store';

// Define response types
interface GeminiResponse {
  text: string[];
  images: string[];
}

interface StreamCallbacks {
  onTextToken: (text: string) => void;
  onImage: (image: string) => void;
  onComplete: () => void;
}

// Initialize Gemini client
function getGeminiClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Get the user's API key from local storage
 */
export function getUserApiKey(): string | null {
  if (!browser) return null;
  return localStorage.getItem('gemini_api_key');
}

/**
 * Save the user's API key to local storage
 */
export function saveUserApiKey(apiKey: string): void {
  if (!browser) return;
  localStorage.setItem('gemini_api_key', apiKey);
}

/**
 * Clear the user's API key from local storage
 */
export function clearUserApiKey(): void {
  if (!browser) return;
  localStorage.removeItem('gemini_api_key');
}

/**
 * Generate an image from a text prompt using Gemini
 * 
 * @param prompt The text prompt to generate an image from
 * @returns A promise that resolves to the generated image and text
 */
export async function generateContent(
  prompt: string,
  callbacks: StreamCallbacks
): Promise<GeminiResponse> {
  const apiKey = getUserApiKey();
  
  if (!apiKey) {
    throw new Error('No API key found. Please add your Gemini API key in settings.');
  }
  
  try {
    const genAI = getGeminiClient(apiKey);
    
    // Use the image generation model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation"
    });

    console.log('📊 Using model for content generation:', "gemini-2.0-flash-exp-image-generation");

    // For image generation, we can't use streaming
    const result = await model.generateContent([
      { text: prompt }
    ]);

    const response: GeminiResponse = {
      text: [],
      images: []
    };

    // Process the response
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text) {
        response.text.push(part.text);
        callbacks.onTextToken(part.text);
      } else if (part.inlineData) {
        response.images.push(part.inlineData.data);
        callbacks.onImage(part.inlineData.data);
      }
    }

    callbacks.onComplete();
    return response;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<GeminiResponse> {
  const apiKey = getUserApiKey();
  
  if (!apiKey) {
    throw new Error('No API key found. Please add your Gemini API key in settings.');
  }

  console.log('📤 CLIENT: Sending image generation request to server endpoint:', { prompt });

  try {
    // Add a direct console log to verify this code is being executed
    console.log('🔍 CLIENT: About to fetch from /api/gemini endpoint');
    
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        apiKey
      })
    });

    console.log('📥 CLIENT: Received response status from server:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ CLIENT: API error:', error);
      throw new Error(error.message || 'Failed to generate image');
    }

    const data = await response.json();
    console.log('✨ CLIENT: Processed response from server:', {
      textResponseCount: data.text.length,
      imageResponseCount: data.images.length,
      textSample: data.text.length > 0 ? data.text[0].substring(0, 50) + '...' : 'No text',
      hasImages: data.images.length > 0
    });

    return data;
  } catch (error) {
    console.error('❌ CLIENT: Error in generateImage:', error);
    throw error;
  }
}

/**
 * Edit an image based on instructions using Gemini
 * 
 * @param imageData Base64 encoded image data
 * @param editInstructions Text instructions for editing the image
 * @returns A promise that resolves to the edited image and text
 */
export async function editImage(imageData: string, editInstructions: string): Promise<GeminiResponse> {
  const apiKey = getUserApiKey();
  
  if (!apiKey) {
    throw new Error('No API key found. Please add your Gemini API key in settings.');
  }
  
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({
      model: get(uiStore).selectedModel,
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048
      }
    });
    
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData
        }
      },
      { text: editInstructions }
    ]);
    
    const response = await result.response;
    const candidates = response.candidates || [];
    
    if (candidates.length === 0) {
      throw new Error('No content was generated. Please try a different prompt.');
    }
    
    const geminiResponse: GeminiResponse = {
      text: [],
      images: []
    };
    
    const parts = candidates[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text) {
        geminiResponse.text.push(part.text);
      } else if (part.inlineData) {
        geminiResponse.images.push(part.inlineData.data);
      }
    }
    
    return geminiResponse;
  } catch (error) {
    console.error('Error editing image:', error);
    throw error;
  }
}

/**
 * Continue a conversation for multi-turn image editing
 * 
 * @param conversationHistory Previous conversation history
 * @param newInstruction New instruction for the model
 * @returns A promise that resolves to the response and updated history
 */
export async function continueImageEditing(
  conversationHistory: any[],
  newInstruction: string
): Promise<GeminiResponse> {
  const apiKey = getUserApiKey();
  
  if (!apiKey) {
    throw new Error('No API key found. Please add your Gemini API key in settings.');
  }
  
  try {
    const genAI = getGeminiClient(apiKey);
    
    // Get the Gemini Flash model
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048
      }
    });
    
    // Start a chat
    const chat = model.startChat({
      history: conversationHistory
    });
    
    // Send the new instruction
    const result = await chat.sendMessage(newInstruction);
    const response = await result.response;
    
    // Process the response parts (text and images)
    const geminiResponse: GeminiResponse = {
      text: [],
      images: []
    };
    
    // Extract text and images from response
    const candidates = response.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text) {
        geminiResponse.text.push(part.text);
      } else if (part.inlineData) {
        // Base64 image data
        geminiResponse.images.push(part.inlineData.data);
      }
    }
    
    return geminiResponse;
  } catch (error) {
    console.error('Error in conversation editing:', error);
    throw error;
  }
}

/**
 * Convert chat messages to Gemini conversation history format
 * 
 * @param messages Array of chat messages
 * @returns Formatted conversation history for Gemini API
 */
export function formatChatHistoryForGemini(messages: ChatMessage[]): any[] {
  return messages.map(message => ({
    role: message.type === 'user' ? 'user' : 'model',
    parts: [{ text: message.text }]
  }));
}

/**
 * Convert a file to base64
 * 
 * @param file File to convert
 * @returns Promise that resolves to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Check if the API key is valid by making a simple request
 * 
 * @param apiKey The API key to validate
 * @returns Promise that resolves to true if valid, false otherwise
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048
      }
    });
    await model.generateContent("Test");
    return true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
} 