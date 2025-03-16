# API Integration Guide: Gemini 2.0 Flash

This guide explains how to integrate Google's Gemini 2.0 Flash API for image generation and editing in the Vibe Photoshop application.

## Overview

Gemini 2.0 Flash is Google's native image generation model that offers high-quality image creation and editing capabilities. For this application, users will:

1. Obtain their own API key from Google
2. Enter it into our application
3. Use it to generate and edit images

## Prerequisites

To use the Gemini 2.0 Flash API, users need:

1. A Google Cloud Platform account
2. API key with access to Gemini 2.0 Flash
3. Billing enabled on their Google Cloud account

## Getting an API Key (User Instructions)

Include these instructions in your app's onboarding or settings page:

1. Go to the [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Create a new API key by clicking on "Get API key"
4. Copy your API key
5. Enter this API key in the Vibe Photoshop application settings

## Securing API Keys

For security, our application will:

1. Store API keys encrypted in Firestore
2. Never expose API keys in client-side code
3. Use environment variables for any backend functions

## Implementation Details

### 1. Client-Side API Handling

```javascript
// src/lib/api/gemini.js

import { auth } from '$lib/firebase';
import { getUserApiKey } from '$lib/api/user';

// Updated to use the experimental model version with image generation
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export async function generateImage(prompt) {
  try {
    // Get user's API key (securely)
    const apiKey = await getUserApiKey(auth.currentUser.uid);
    
    if (!apiKey) {
      throw new Error('No API key found. Please add your Gemini API key in settings.');
    }
    
    // Updated payload for image generation with the new API
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generation_config: {
        temperature: 0.4,
        top_p: 1,
        top_k: 32,
        max_output_tokens: 2048,
      },
      safety_settings: [
        // Standard safety settings...
      ],
      // Specify that we want both text and image in the response
      response_modalities: ["Text", "Image"]
    };
    
    // Make API call
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error.message}`);
    }
    
    const data = await response.json();
    
    // Process the response parts (text and images)
    const result = {
      text: [],
      images: []
    };
    
    // Extract text and images from response
    for (const part of data.candidates[0].content.parts) {
      if (part.text) {
        result.text.push(part.text);
      } else if (part.inlineData) {
        // Base64 image data
        result.images.push(part.inlineData.data);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export async function editImage(imageData, editInstructions) {
  try {
    // Get user's API key (securely)
    const apiKey = await getUserApiKey(auth.currentUser.uid);
    
    if (!apiKey) {
      throw new Error('No API key found. Please add your Gemini API key in settings.');
    }
    
    // Payload for editing an existing image
    const payload = {
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData // Base64 encoded image
            }
          },
          {
            text: editInstructions
          }
        ]
      }],
      generation_config: {
        temperature: 0.4,
        top_p: 1,
        top_k: 32,
        max_output_tokens: 2048,
      },
      response_modalities: ["Text", "Image"]
    };
    
    // Make API call
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error.message}`);
    }
    
    const data = await response.json();
    
    // Similar processing as generateImage
    const result = {
      text: [],
      images: []
    };
    
    for (const part of data.candidates[0].content.parts) {
      if (part.text) {
        result.text.push(part.text);
      } else if (part.inlineData) {
        result.images.push(part.inlineData.data);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error editing image:', error);
    throw error;
  }
}

// Conversation-based image editing (multi-turn)
export async function continueImageEditing(conversationHistory, newInstruction) {
  try {
    // Get user's API key (securely)
    const apiKey = await getUserApiKey(auth.currentUser.uid);
    
    if (!apiKey) {
      throw new Error('No API key found. Please add your Gemini API key in settings.');
    }
    
    // Format the conversation history as expected by the API
    const contents = conversationHistory.map(msg => ({
      parts: msg.parts,
      role: msg.role
    }));
    
    // Add the new instruction
    contents.push({
      parts: [{ text: newInstruction }],
      role: "user"
    });
    
    const payload = {
      contents,
      generation_config: {
        temperature: 0.4,
        top_p: 1,
        top_k: 32,
        max_output_tokens: 2048,
      },
      response_modalities: ["Text", "Image"]
    };
    
    // Make API call
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error.message}`);
    }
    
    const data = await response.json();
    
    // Process response as before
    const result = {
      text: [],
      images: []
    };
    
    for (const part of data.candidates[0].content.parts) {
      if (part.text) {
        result.text.push(part.text);
      } else if (part.inlineData) {
        result.images.push(part.inlineData.data);
      }
    }
    
    // Add this response to the conversation history for future turns
    conversationHistory.push({
      parts: data.candidates[0].content.parts,
      role: "model"
    });
    
    return {
      result,
      updatedHistory: conversationHistory
    };
  } catch (error) {
    console.error('Error in conversation editing:', error);
    throw error;
  }
}
```

### 2. Storing Generated Images

```javascript
// src/lib/storage/images.js

import { storage, db } from '$lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function saveGeneratedImage(userId, imageData, prompt, textContent = null) {
  const imageId = uuidv4();
  
  // 1. Save to Firebase Storage
  const storageRef = ref(storage, `images/${userId}/${imageId}.jpg`);
  await uploadString(storageRef, imageData, 'base64');
  const downloadUrl = await getDownloadURL(storageRef);
  
  // 2. Create thumbnail (implementation depends on your approach)
  const thumbnailRef = ref(storage, `thumbnails/${userId}/${imageId}.jpg`);
  await uploadString(thumbnailRef, createThumbnail(imageData), 'base64');
  const thumbnailUrl = await getDownloadURL(thumbnailRef);
  
  // 3. Save metadata to Firestore
  await setDoc(doc(db, 'images', imageId), {
    userId,
    prompt,
    textContent, // Associated text if any
    title: generateTitle(prompt),
    createdAt: new Date(),
    storageUrl: downloadUrl,
    thumbnailUrl,
    isPublic: false
  });
  
  return {
    id: imageId,
    url: downloadUrl,
    thumbnail: thumbnailUrl
  };
}
```

### 3. Implementing Version Control

```javascript
// src/lib/storage/versions.js

import { storage, db } from '$lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function saveImageVersion(userId, imageId, imageData, editDescription, textContent = null) {
  // 1. Get current version number
  const versionsRef = collection(db, 'versions');
  const q = query(
    versionsRef, 
    where('imageId', '==', imageId),
    orderBy('versionNumber', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  const versionNumber = snapshot.empty ? 1 : snapshot.docs[0].data().versionNumber + 1;
  
  // 2. Generate version ID
  const versionId = uuidv4();
  
  // 3. Save to Firebase Storage
  const storageRef = ref(storage, `versions/${userId}/${imageId}/${versionId}.jpg`);
  await uploadString(storageRef, imageData, 'base64');
  const downloadUrl = await getDownloadURL(storageRef);
  
  // 4. Create thumbnail
  const thumbnailRef = ref(storage, `thumbnails/${userId}/${imageId}/${versionId}.jpg`);
  await uploadString(thumbnailRef, createThumbnail(imageData), 'base64');
  const thumbnailUrl = await getDownloadURL(thumbnailRef);
  
  // 5. Save metadata to Firestore
  await setDoc(doc(db, 'versions', versionId), {
    imageId,
    userId,
    versionNumber,
    editDescription,
    textContent, // Associated text if any
    createdAt: new Date(),
    storageUrl: downloadUrl,
    thumbnailUrl
  });
  
  // 6. Update the parent image's latestVersionId
  await setDoc(doc(db, 'images', imageId), {
    latestVersionId: versionId,
    versionCount: versionNumber
  }, { merge: true });
  
  return {
    id: versionId,
    url: downloadUrl,
    thumbnail: thumbnailUrl,
    versionNumber
  };
}
```

## Error Handling

Implement robust error handling for API calls:

1. **API Key Errors**: Check validity before making calls
2. **Rate Limiting**: Handle 429 errors with appropriate user feedback
3. **Content Filtering**: Handle safety filter rejections gracefully
4. **Network Issues**: Implement retries for transient failures
5. **Image Generation Failures**: Sometimes the model may not generate images or may stop part way through - implement retry logic

## Quotas and Limitations

Communicate the following limitations to users:

1. Gemini 2.0 Flash may have daily or monthly quotas
2. Response time may vary based on image complexity
3. Content policies may restrict certain types of generations
4. Best performance in specific languages (EN, es-MX, ja-JP, zh-CN, hi-IN)
5. For text rendering in images, it's recommended to ask for text first then the image

## Best Practices

1. **Caching**: Cache generated images to avoid redundant API calls
2. **Batch Processing**: Group related operations to minimize API calls
3. **Progressive Loading**: Show placeholders during generation
4. **Fallbacks**: Have fallback options if API is unavailable
5. **Conversation Management**: Maintain conversation history for multi-turn editing
6. **Watermarking**: Note that all generated images include a SynthID watermark 