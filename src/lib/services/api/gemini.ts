/**
 * Gemini API Service
 * 
 * This service provides functions to interact with Google's Gemini API
 * for image generation and editing using the official @google/generative-ai package.
 */

import { browser } from '$app/environment';
import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai';
import type { ChatMessage } from '$lib/stores/chatStore';

// Define response types
interface GeminiResponse {
  text: string[];
  images: string[];
}

interface GeminiConversationResponse {
  result: GeminiResponse;
  updatedHistory: any[];
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
export async function generateImage(prompt: string): Promise<GeminiResponse> {
  const apiKey = getUserApiKey();
  
  if (!apiKey) {
    throw new Error('No API key found. Please add your Gemini API key in settings.');
  }
  
  try {
    const genAI = getGeminiClient(apiKey);
    
    // Get the Gemini Flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseModalities: ["Text", "Image"]
      }
    });
    
    // Generate content
    const result = await model.generateContent([
      { text: prompt }
    ]);
    
    const response = await result.response;
    const candidates = response.candidates || [];
    
    if (candidates.length === 0) {
      throw new Error('No content was generated. Please try a different prompt.');
    }
    
    // Process the response parts (text and images)
    const geminiResponse: GeminiResponse = {
      text: [],
      images: []
    };
    
    // Extract text and images from response
    for (const part of candidates[0].content.parts) {
      if (part.text) {
        geminiResponse.text.push(part.text);
      } else if (part.inlineData) {
        // Base64 image data
        geminiResponse.images.push(part.inlineData.data);
      }
    }
    
    return geminiResponse;
  } catch (error) {
    console.error('Error generating image:', error);
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
    
    // Get the Gemini Flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseModalities: ["Text", "Image"]
      }
    });
    
    // Generate content with image and text
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
    
    // Process the response parts (text and images)
    const geminiResponse: GeminiResponse = {
      text: [],
      images: []
    };
    
    // Extract text and images from response
    for (const part of candidates[0].content.parts) {
      if (part.text) {
        geminiResponse.text.push(part.text);
      } else if (part.inlineData) {
        // Base64 image data
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
): Promise<GeminiConversationResponse> {
  const apiKey = getUserApiKey();
  
  if (!apiKey) {
    throw new Error('No API key found. Please add your Gemini API key in settings.');
  }
  
  try {
    const genAI = getGeminiClient(apiKey);
    
    // Get the Gemini Flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseModalities: ["Text", "Image"]
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
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        geminiResponse.text.push(part.text);
      } else if (part.inlineData) {
        // Base64 image data
        geminiResponse.images.push(part.inlineData.data);
      }
    }
    
    // Get the updated history
    const updatedHistory = await chat.getHistory();
    
    return {
      result: geminiResponse,
      updatedHistory
    };
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent("Test");
    return true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
} 