# API Integration Guide: Gemini 2.0 Flash (SDK Approach)

This guide explains how to integrate Google's Gemini 2.0 Flash API for image generation and editing in the Vibe Photoshop application using the official Google GenAI SDK.

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

## Installing the Google GenAI SDK

Install the Google GenAI SDK in your SvelteKit project:

```bash
npm install @google/genai
```

> **Note**: According to the official documentation, this SDK is experimental and may experience breaking changes. We should monitor for updates and be prepared to adjust our implementation accordingly.

## Implementation Details

### 1. Client-Side API Integration with SDK

```javascript
// src/lib/api/gemini.js

import { auth } from '$lib/firebase';
import { getUserApiKey } from '$lib/api/user';
import { genai } from '@google/genai';

export async function generateImage(prompt) {
  try {
    // Get user's API key (securely)
    const apiKey = await getUserApiKey(auth.currentUser.uid);
    
    if (!apiKey) {
      throw new Error('No API key found. Please add your Gemini API key in settings.');
    }
    
    // Initialize the Google GenAI client with the user's API key
    const client = genai.Client(apiKey);
    
    // Generate content using the SDK
    const response = await client.models.generateContent({
      model: "models/gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"]
      }
    });
    
    // Process the response parts (text and images)
    const result = {
      text: [],
      images: []
    };
    
    // Extract text and images from response
    for (const part of response.candidates[0].content.parts) {
      if (part.text !== null) {
        result.text.push(part.text);
      } else if (part.inlineData !== null) {
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
    const apiKey = await getUserApiKey(auth.currentUser.uid);
    if (!apiKey) {
      throw new Error('No API key found. Please add your Gemini API key in settings.');
    }
    
    const client = genai.Client(apiKey);
    
    // Create parts array with image and text
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData // Base64 encoded image
      }
    };
    
    const textPart = { text: editInstructions };
    
    // Generate content
    const response = await client.models.generateContent({
      model: "models/gemini-2.0-flash-exp",
      contents: [{ parts: [imagePart, textPart] }],
      config: {
        responseModalities: ["Text", "Image"]
      }
    });
    
    // Process response
    const result = {
      text: [],
      images: []
    };
    
    for (const part of response.candidates[0].content.parts) {
      if (part.text !== null) {
        result.text.push(part.text);
      } else if (part.inlineData !== null) {
        result.images.push(part.inlineData.data);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error editing image:', error);
    throw error;
  }
}

// Multi-turn conversation for image editing
export async function continueImageEditing(conversationHistory, newInstruction) {
  try {
    const apiKey = await getUserApiKey(auth.currentUser.uid);
    if (!apiKey) {
      throw new Error('No API key found. Please add your Gemini API key in settings.');
    }
    
    const client = genai.Client(apiKey);
    
    // Create a chat session
    const chat = client.models.startChat({
      model: "models/gemini-2.0-flash-exp",
      history: conversationHistory,
      config: {
        responseModalities: ["Text", "Image"]
      }
    });
    
    // Send a message to continue the conversation
    const response = await chat.sendMessage(newInstruction);
    
    // Process response
    const result = {
      text: [],
      images: []
    };
    
    for (const part of response.candidates[0].content.parts) {
      if (part.text !== null) {
        result.text.push(part.text);
      } else if (part.inlineData !== null) {
        result.images.push(part.inlineData.data);
      }
    }
    
    // Add this response to the conversation history
    const updatedHistory = [...conversationHistory];
    updatedHistory.push({
      parts: response.candidates[0].content.parts,
      role: "model"
    });
    
    return {
      result,
      updatedHistory
    };
  } catch (error) {
    console.error('Error in conversation editing:', error);
    throw error;
  }
}
```

### 2. Image Display Component

Creating a component to display the generated images:

```svelte
<!-- src/lib/components/ImagePreview.svelte -->
<script>
  import { onMount } from 'svelte';
  
  export let imageData = null; // Base64 image data
  export let altText = 'Generated image';
  
  let imageUrl = '';
  
  onMount(() => {
    if (imageData) {
      // Convert base64 data to a displayable URL
      imageUrl = `data:image/jpeg;base64,${imageData}`;
    }
  });
</script>

{#if imageUrl}
  <div class="image-preview">
    <img src={imageUrl} alt={altText} />
  </div>
{:else}
  <div class="image-placeholder">
    <p>No image to display</p>
  </div>
{/if}

<style>
  .image-preview {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .image-preview img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .image-placeholder {
    width: 100%;
    max-width: 600px;
    height: 300px;
    margin: 0 auto;
    border-radius: 8px;
    background-color: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
  }
</style>
```

### 3. Image Generation Form Component

```svelte
<!-- src/lib/components/ImageGenerator.svelte -->
<script>
  import { generateImage } from '$lib/api/gemini';
  import ImagePreview from './ImagePreview.svelte';
  import { saveGeneratedImage } from '$lib/storage/images';
  import { user } from '$lib/stores/auth';
  
  let prompt = '';
  let isGenerating = false;
  let error = null;
  let result = { text: [], images: [] };
  
  async function handleSubmit() {
    if (!prompt.trim()) return;
    
    isGenerating = true;
    error = null;
    
    try {
      result = await generateImage(prompt);
      
      // Automatically save the image if generated successfully
      if (result.images.length > 0 && $user) {
        await saveGeneratedImage(
          $user.uid, 
          result.images[0], 
          prompt,
          result.text.join('\n')
        );
      }
    } catch (err) {
      error = err.message || 'Failed to generate image';
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }
</script>

<div class="image-generator">
  <h2>Create an Image</h2>
  
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="prompt">Describe the image you want to create</label>
      <textarea
        id="prompt"
        bind:value={prompt}
        placeholder="E.g., A 3D rendered image of a pig with wings and a top hat flying over a futuristic scifi city with lots of greenery"
        rows="4"
        disabled={isGenerating}
      ></textarea>
    </div>
    
    <button type="submit" disabled={isGenerating || !prompt.trim()}>
      {isGenerating ? 'Generating...' : 'Generate Image'}
    </button>
  </form>
  
  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {/if}
  
  {#if result.images.length > 0}
    <div class="result-container">
      <ImagePreview imageData={result.images[0]} altText={prompt} />
      
      {#if result.text.length > 0}
        <div class="generated-text">
          {#each result.text as text}
            <p>{text}</p>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .image-generator {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h2 {
    margin-bottom: 20px;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    font-family: inherit;
  }
  
  button {
    background-color: #4f46e5;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: #4338ca;
  }
  
  button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  .error-message {
    margin-top: 16px;
    padding: 12px;
    background-color: #fee2e2;
    border-radius: 4px;
    color: #ef4444;
  }
  
  .result-container {
    margin-top: 32px;
  }
  
  .generated-text {
    margin-top: 16px;
    padding: 16px;
    background-color: #f3f4f6;
    border-radius: 4px;
  }
</style>
```

### 4. Storing Generated Images (Same as before)

We'll continue using Firebase Storage for saving generated images, as detailed in our previous implementation.

## Enhanced SDK Features

According to the official SDK documentation, here are additional features we can leverage:

### 1. Streaming Responses

For a better user experience, we can implement streaming responses which show generation progress in real-time:

```javascript
export async function streamGenerateImage(prompt, onChunkReceived) {
  try {
    const apiKey = await getUserApiKey(auth.currentUser.uid);
    if (!apiKey) throw new Error('No API key found');
    
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001"
    });
    
    // Stream the response
    const response = await model.generateContentStream({
      contents: [{ text: prompt }],
      responseModalities: ["Text", "Image"]
    });
    
    for await (const chunk of response) {
      // Process each chunk as it arrives
      onChunkReceived(chunk);
    }
  } catch (error) {
    console.error('Error streaming image generation:', error);
    throw error;
  }
}
```

### 2. GoogleGenAI SDK Overview

The SDK provides several submodules for different functionalities:

- `client.models`: Query models (generateContent, generateImages)
- `client.caches`: Create and manage caches for cost reduction with repeated prompts
- `client.chats`: Create stateful chat objects for multi-turn interactions
- `client.files`: Upload files to the API for reference in prompts
- `client.live`: Start live sessions for real-time interaction

### 3. Function Calling (Future Feature)

While not directly relevant to our image generation use case, the SDK supports function calling which we could use in future enhancements:

```javascript
// Example of function declaration for future features
const functionDeclaration = {
  name: 'applyFilter',
  parameters: {
    type: 'OBJECT',
    properties: {
      filterType: {
        type: 'STRING',
        description: 'Type of filter to apply (vintage, noir, etc.)'
      },
      intensity: {
        type: 'NUMBER',
        description: 'Filter intensity from 0-100'
      }
    },
    required: ['filterType']
  }
};

// This could be used to let Gemini decide what filters to apply to images
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
6. **API Key Security**: As emphasized in the official docs, never expose API keys in client-side code
7. **SDK Versioning**: Monitor for updates as this is an experimental SDK
8. **Watermarking**: Note that all generated images include a SynthID watermark

## SDK Comparison: Python vs JavaScript

| Python (Example from Docs) | JavaScript (Our Implementation) |
|----------------------------|--------------------------------|
| `from google import genai` | `import { GoogleGenAI } from '@google/genai'` |
| `client = genai.Client()` | `const genAI = new GoogleGenAI(apiKey)` |
| `client.models.generate_content()` | `model.generateContent()` |
| `types.GenerateContentConfig(response_modalities=['Text', 'Image'])` | `responseModalities: ["Text", "Image"]` |
| `part.text is not None` | `if (part.text)` |
| `part.inline_data is not None` | `if (part.inlineData)` |

The JavaScript SDK provides equivalent functionality to the Python SDK, making it straightforward to implement the same features in our SvelteKit application. 

## Key Implementation Notes from Official Documentation

1. **Model Name**: The correct model name is `models/gemini-2.0-flash-exp`

2. **Response Modalities**: Always include `responseModalities: ["Text", "Image"]` in your generation configuration for text and image output

3. **Generation Modes**:
   - Text to image: "Generate an image of the Eiffel tower with fireworks"
   - Text to image + text: "Generate an illustrated recipe for paella"
   - Image editing: "Edit this image to make it look like a cartoon"
   - Multi-turn editing: Upload image → "Turn this car into a convertible" → "Now change the color to yellow"

4. **Language Support**: Best performance in:
   - English (EN)
   - Spanish (es-MX)
   - Japanese (ja-JP)
   - Chinese (zh-CN)
   - Hindi (hi-IN)

5. **Limitations**:
   - No audio/video input support
   - Image generation may not always trigger (may output text only)
   - Generation may stop partway through
   - For text rendering in images, generate text first then ask for image
   - All generated images include a SynthID watermark

6. **Best Practices**:
   - When image generation doesn't trigger, try explicit prompts like "generate an image" or "provide images as you go along"
   - For text-heavy images, generate the text first, then request the image
   - Implement retry logic for cases where generation stops partway
   - Handle both text and image outputs in your response processing

7. **SDK Versioning**: Monitor for updates as this is an experimental SDK 